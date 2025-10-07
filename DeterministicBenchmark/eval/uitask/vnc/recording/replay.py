"""
This file provides tools for parsing and replaying recorded VNC sessions.
"""

from __future__ import annotations

import logging
import struct
import threading
import time
from collections.abc import Callable, Iterator
from contextlib import contextmanager
from dataclasses import dataclass
from pathlib import Path
from struct import Struct
from typing import IO, Any, ClassVar, Literal, Self, TypeVar

from PIL.Image import Image

from ..protocol import HandshakeStateMachine, RfbSession
from ..rfb_messages import (
    ClientMessage,
    FramebufferUpdate,
    KeyEvent,
    PointerEvent,
    ProtocolVersion,
    QemuExtendedKeyEvent,
    SecurityType,
    ServerMessage,
    _unpack_stream,
    parse_client_message,
)


@dataclass(frozen=True)
class RfbReplayStep:
    """
    Represents a single step in the RFB replay.
    """

    timestamp: int  # u64, nanoseconds
    screen: Image
    event: PointerEvent | KeyEvent | None


@dataclass(init=False)
class RfbReplayParser:
    """
    Parses RFB replay streams and reconstructs framebuffer updates, cursor movements,
    and events to produce a sequence of steps for playback.
    """

    _streams: RfbReplayStreams
    _session: RfbSession
    _images: list[Image]

    def __init__(self, streams: RfbReplayStreams) -> None:
        """
        Initializes the RfbReplayParser with the provided streams.

        Args:
            streams: The RFB replay streams.
        """
        self._streams = streams

        # Perform RFB handshake and save the `RfbConnectedSession` once connected
        try:
            rfb_handshake_state = HandshakeStateMachine()
            while True:
                _, rfb_session = streams.parse_next_message(
                    parse_client_message=rfb_handshake_state.parse_client_message,
                    parse_server_message=rfb_handshake_state.parse_server_message,
                )
                if rfb_session is not None:
                    self._session = rfb_session
                    break
        except StopIteration:
            raise ValueError("Invalid RFB replay, failed to replay handshake")

        self._images = []

    def iter_steps(
        self,
        continuous: bool = False,
        images_with_cursor: bool = True,
    ) -> Iterator[RfbReplayStep]:
        """
        Iterates through the replay steps, yielding the timestamp, framebuffer state,
        and event at each step.

        Args:
            continuous:
                If False, only generate a replay step on a user action (key or mouse event).
                if True, also generate a replay step when the screen updates.
            images_with_cursor:
                If True, then return the screen at each step with the cursor drawn on. If False,
                then return the screen at each step without any cursor.

        Yields:
            RfbReplayStep: The replay step containing timestamp, screen, and event.
        """
        for timestamp, message in self.iter_raw_messages():
            match message:
                case FramebufferUpdate():
                    if continuous:
                        yield RfbReplayStep(
                            timestamp=timestamp,
                            screen=(
                                self._session.get_image_with_cursor()
                                if images_with_cursor
                                else self._session.get_image_without_cursor()
                            ),
                            event=None,
                        )
                case QemuExtendedKeyEvent():
                    # Convert a QemuExtendedKeyEvent to a KeyEvent, using keysym and ignoring keycode
                    yield RfbReplayStep(
                        timestamp=timestamp,
                        screen=(
                            self._session.get_image_with_cursor()
                            if images_with_cursor
                            else self._session.get_image_without_cursor()
                        ),
                        event=KeyEvent(
                            key=message.keysym,
                            is_down=message.is_down,
                        ),
                    )
                case KeyEvent() | PointerEvent():
                    yield RfbReplayStep(
                        timestamp=timestamp,
                        screen=(
                            self._session.get_image_with_cursor()
                            if images_with_cursor
                            else self._session.get_image_without_cursor()
                        ),
                        event=message,
                    )
                case _:
                    # Ignore all other message kinds
                    continue

    def iter_raw_messages(self) -> Iterator[tuple[int, ClientMessage | ServerMessage]]:
        while True:
            try:
                timestamp, message = self._streams.parse_next_message(
                    parse_client_message=self._parse_and_handle_client_message,
                    parse_server_message=self._parse_and_handle_server_message,
                )
                yield (timestamp, message)
            except StopIteration:
                break

    def _parse_and_handle_client_message(self, message_bytes: IO[bytes]) -> ClientMessage:
        message = parse_client_message(message_bytes)
        self._session.handle_client_message(message)
        return message

    def _parse_and_handle_server_message(self, message_bytes: IO[bytes]) -> ServerMessage:
        message = self._session.parse_server_message(message_bytes)
        self._session.handle_server_message(message)
        return message


ClientMessageT = TypeVar("ClientMessageT")
ServerMessageT = TypeVar("ServerMessageT")


@dataclass
class RfbReplayStreams:
    """
    Handles interleaved client and server messages from VNC replay streams.
    """

    client_messages: IO[bytes]
    client_timestamps: _TimestampAnnotationStream
    has_client_messages: bool

    server_messages: IO[bytes]
    server_timestamps: _TimestampAnnotationStream
    has_server_messages: bool

    @classmethod
    @contextmanager
    def from_files(cls, prefix: Path) -> Iterator[Self]:
        """
        Context manager to create RfbReplayStreams from files with the given prefix.

        Args:
            prefix: The prefix for the files.
        """
        with (
            RfbMessageStream.from_files(prefix, "client", "rb") as client,
            RfbMessageStream.from_files(prefix, "server", "rb") as server,
        ):
            yield cls(
                client_messages=client.messages,
                client_timestamps=_TimestampAnnotationStream(client.timestamps),
                has_client_messages=True,
                server_messages=server.messages,
                server_timestamps=_TimestampAnnotationStream(server.timestamps),
                has_server_messages=True,
            )

    def parse_next_message(
        self,
        parse_server_message: Callable[[IO[bytes]], ServerMessageT],
        parse_client_message: Callable[[IO[bytes]], ClientMessageT],
    ) -> tuple[int, ClientMessageT | ServerMessageT]:
        """
        Parses interleaved client and server messages based on timestamps.

        Args:
            parse_server_message: Function to parse server messages
            parse_client_message: Function to parse client messages

        Returns:
            A tuple containing the timestamp and the parsed message.
        """
        if self.has_server_messages or self.has_client_messages:
            # Interleave the messages based on the timestamps
            (next_client_timestamp, next_server_timestamp) = self._next_message_timestamps()
            next_message_is_server = next_server_timestamp < next_client_timestamp

            if self.has_server_messages and (
                not self.has_client_messages or next_message_is_server
            ):
                try:
                    return (next_server_timestamp, parse_server_message(self.server_messages))
                except EOFError:
                    # Also ignores potentially incomplete messages at the end
                    self.has_server_messages = False
            else:
                assert self.has_client_messages
                try:
                    return (next_client_timestamp, parse_client_message(self.client_messages))
                except EOFError:
                    # Also ignores potentially incomplete messages at the end
                    self.has_client_messages = False

        raise StopIteration()

    def _next_message_timestamps(self) -> tuple[int, int]:
        """
        Gets the next message timestamps for both client and server streams.

        Returns:
            A tuple containing the next client and server timestamps.
        """
        next_client_timestamp = self.client_timestamps.get_monotonic(self.client_messages.tell())
        next_server_timestamp = self.server_timestamps.get_monotonic(self.server_messages.tell())
        return (next_client_timestamp, next_server_timestamp)


@dataclass
class RfbMessageStream:
    """
    Handles the message and timestamp streams for either client or server messages.
    """

    timestamps: IO[bytes]
    messages: IO[bytes]

    @classmethod
    @contextmanager
    def from_files(
        cls,
        prefix: Path,
        suffix: Literal["client", "server"],
        mode: str = "rb",
    ) -> Iterator[Self]:
        """
        Context manager to open timestamp and message files.

        Args:
            prefix: The prefix for the files.
            suffix: The suffix indicating client or server.
            mode: The file mode to open the files in.
        """
        timestamps_path = prefix / f"{suffix}.time.bin"
        messages_path = prefix / f"{suffix}.rfb.bin"

        with (
            open(timestamps_path, mode) as timestamps,
            open(messages_path, mode) as messages,
        ):
            yield cls(
                timestamps=timestamps,
                messages=messages,
            )


@dataclass(frozen=True)
class TimestampAnnotation:
    """
    Represents a timestamp annotation for a message in a VNC stream.
    """

    # The timestamp in nanoseconds when the message was received
    timestamp: int  # u64

    # The cumulative length of all messages received up to this point.
    length: int  # u64

    # Serialized format
    _STRUCT: ClassVar[Struct] = Struct("!QQ")

    def to_bytes(self) -> bytes:
        return self._STRUCT.pack(self.timestamp, self.length)

    @classmethod
    def from_bytes(cls, stream: IO[bytes]) -> Self:
        return cls(*_unpack_stream(cls._STRUCT, stream))


@dataclass(init=False)
class _TimestampAnnotationStream:
    """
    Manages the stream of timestamp annotations and provides methods to get the timestamp for a
    given byte position.
    """

    _stream: IO[bytes]
    _stream_finished: bool
    _current_timestamp: TimestampAnnotation
    _last_queried_position: int

    def __init__(self, stream: IO[bytes]) -> None:
        """
        Initializes the _TimestampAnnotationStream.

        Args:
            stream: The stream of timestamp annotations.
        """
        self._stream = stream
        self._stream_finished = False
        self._current_timestamp = TimestampAnnotation.from_bytes(self._stream)
        self._last_queried_position = 0

    def get_monotonic(self, position: int) -> int:
        """
        Get the timestamp for a byte position in the file with the raw tcp
        stream with RFB messages.

        Args:
            position: The byte position in the stream.

        Returns:
            The corresponding timestamp in nanoseconds.
        """
        assert position >= self._last_queried_position, (
            f"Queried positions in the timestamp stream should be monotonic, "
            f"got {self._last_queried_position=} {position=}",
        )
        self._last_queried_position = position

        try:
            while not self._stream_finished and position >= self._current_timestamp.length:
                # Note the >=, if postion == self._current_timestamp.length we need to read
                # the next timestamp.
                self._current_timestamp = TimestampAnnotation.from_bytes(self._stream)
        except EOFError:
            self._stream_finished = True

        if self._stream_finished:
            assert position <= self._current_timestamp.length, (
                # allow exactly off by one, as we'll try to read one
                # more message at the end
                f"Out of bound position for timestamp stream, "
                f"got {self._current_timestamp=} {position=}",
            )

        return self._current_timestamp.timestamp


class RfbRecordingWriter:
    """Write-through recorder for client/server byte streams with timestamps.

    Produces files compatible with the replay/export pipeline.
    """

    def __init__(self, output_dir: Path) -> None:
        self._client_messages = open(output_dir / "client.rfb.bin", "wb")
        self._client_timestamps = open(output_dir / "client.time.bin", "wb")
        self._client_len = 0

        self._server_messages = open(output_dir / "server.rfb.bin", "wb")
        self._server_timestamps = open(output_dir / "server.time.bin", "wb")
        self._server_len = 0

        self._client_lock = threading.Lock()
        self._server_lock = threading.Lock()

    def record_client_bytes(self, data: bytes) -> None:
        if not data:
            return
        with self._client_lock:
            self._client_messages.write(data)
            self._client_len += len(data)
            ts = TimestampAnnotation(timestamp=time.time_ns(), length=self._client_len)
            self._client_timestamps.write(ts.to_bytes())

    def record_server_bytes(self, data: bytes) -> None:
        if not data:
            return
        with self._server_lock:
            self._server_messages.write(data)
            self._server_len += len(data)
            ts = TimestampAnnotation(timestamp=time.time_ns(), length=self._server_len)
            self._server_timestamps.write(ts.to_bytes())

    def record_client_bytes_at(self, data: bytes, timestamp_ns: int) -> None:
        if not data:
            return
        with self._client_lock:
            self._client_messages.write(data)
            self._client_len += len(data)
            ts = TimestampAnnotation(timestamp=timestamp_ns, length=self._client_len)
            self._client_timestamps.write(ts.to_bytes())

    def record_server_bytes_at(self, data: bytes, timestamp_ns: int) -> None:
        if not data:
            return
        with self._server_lock:
            self._server_messages.write(data)
            self._server_len += len(data)
            ts = TimestampAnnotation(timestamp=timestamp_ns, length=self._server_len)
            self._server_timestamps.write(ts.to_bytes())

    def close(self) -> None:
        try:
            self._client_messages.flush()
            self._client_timestamps.flush()
            self._server_messages.flush()
            self._server_timestamps.flush()
        finally:
            self._client_messages.close()
            self._client_timestamps.close()
            self._server_messages.close()
            self._server_timestamps.close()


class RecordingStream(IO[bytes]):
    """IO[bytes] wrapper that tees reads/writes to an RfbRecordingWriter."""

    def __init__(self, underlying: IO[bytes], writer: RfbRecordingWriter) -> None:
        self._underlying = underlying
        self._writer = writer

    def unwrap(self) -> IO[bytes]:
        return self._underlying

    def write(self, data: bytes) -> int:  # pyright: ignore [reportIncompatibleMethodOverride]
        written = self._underlying.write(data)
        self._writer.record_client_bytes(data)
        return written

    def read(self, n: int = 1) -> bytes:
        data = self._underlying.read(n)
        self._writer.record_server_bytes(data)
        return data

    def close(self) -> None:
        self._underlying.close()

    def read_ready(self) -> bool:
        # Delegate to underlying stream if supported; otherwise assume data may be ready
        try:
            underlying_read_ready = getattr(self._underlying, "read_ready", None)
            if callable(underlying_read_ready):
                return bool(underlying_read_ready())
        except Exception:
            return False
        # Fallback when the underlying stream doesn't expose readiness
        return False

    def __enter__(self) -> RecordingStream:
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        self.close()


def emit_handshake_for_recording(
    session: RfbSession,
    client_protocol: ProtocolVersion,
    writer: RfbRecordingWriter,
) -> None:
    """Emit a complete RFB handshake into the recording with ordered timestamps."""
    ts = time.time_ns()

    # Server → client: ProtocolVersion
    writer.record_server_bytes_at(session.handshake.server_protocol_version.to_bytes(), ts)
    ts += 1

    # Client → server: ProtocolVersion
    writer.record_client_bytes_at(client_protocol.to_bytes(), ts)
    ts += 1

    # Server → client: ServerSecurity (offer NONE)
    writer.record_server_bytes_at(bytes((1, SecurityType.NONE.value)), ts)
    ts += 1

    # Client → server: select NONE
    writer.record_client_bytes_at(bytes((SecurityType.NONE.value,)), ts)
    ts += 1

    # Server → client: ServerSecurityResult OK
    writer.record_server_bytes_at(_u32(0), ts)
    ts += 1

    # Client → server: ClientInit (shared flag)
    shared_flag = 1 if session.handshake.client_init.shared else 0
    writer.record_client_bytes_at(bytes((shared_flag,)), ts)
    ts += 1

    # Server → client: ServerInit
    server_init = session.handshake.server_init
    payload = _u16(server_init.screen_width) + _u16(server_init.screen_height)
    payload += server_init.pixel_format.to_bytes()
    name_bytes = server_init.name.encode("iso-8859-1")
    payload += _u32(len(name_bytes)) + name_bytes
    writer.record_server_bytes_at(payload, ts)


def _u32(v: int) -> bytes:
    return struct.pack("!I", v)


def _u16(v: int) -> bytes:
    return struct.pack("!H", v)


_log = logging.getLogger(__name__)

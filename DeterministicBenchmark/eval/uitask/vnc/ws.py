from __future__ import annotations

import asyncio
import logging
import socket
from asyncio import StreamReader, StreamWriter
from dataclasses import dataclass
from pathlib import Path
from typing import Final

from fastapi import WebSocket, WebSocketDisconnect
from websockets.exceptions import ConnectionClosed

from .recording.replay import RfbRecordingWriter


@dataclass(frozen=True)
class RecordingInfo:
    num_client_messages: int
    num_server_messages: int


@dataclass(frozen=True)
class TcpConnection:
    host: str
    port: int


@dataclass(frozen=True)
class Socket:
    ws_socket: socket.socket


@dataclass(frozen=True)
class VncRecorder:
    connection: Socket | TcpConnection

    @classmethod
    def from_connection(cls, host: str, port: int) -> VncRecorder:
        return cls(TcpConnection(host, port))

    @classmethod
    def from_socket(cls, vnc_socket: socket.socket) -> VncRecorder:
        return cls(Socket(vnc_socket))

    async def connect(self) -> tuple[StreamReader, StreamWriter]:
        match self.connection:
            case TcpConnection(host, port):
                return await asyncio.open_connection(host, port)
            case Socket(socket):
                loop = asyncio.get_event_loop()
                reader = asyncio.StreamReader()
                protocol = asyncio.StreamReaderProtocol(reader)
                transport, _ = await loop.create_connection(
                    lambda: protocol,
                    sock=socket,
                )
                writer = asyncio.StreamWriter(transport, protocol, reader, loop)
                return (reader, writer)
            case _:
                raise ValueError("Invalid connection type")

    async def vnc_ws(
        self,
        frontend: WebSocket,
        recording_path: Path,
    ) -> RecordingInfo:
        await frontend.accept()
        reader, writer = await self.connect()

        recording_writer: RfbRecordingWriter = RfbRecordingWriter(recording_path)

        try:
            num_client_messages, num_server_messages = await asyncio.gather(
                forward_client_to_tcp_server(frontend, writer, recording_writer),
                forward_tcp_server_to_client(reader, frontend, recording_writer),
            )
            return RecordingInfo(num_client_messages, num_server_messages)
        finally:
            recording_writer.close()


async def forward_client_to_tcp_server(
    source: WebSocket,
    destination: StreamWriter,
    recording_writer: RfbRecordingWriter,
) -> int:
    """
    Forwards messages from a WebSocket client to the TCP VNC server.

    Args:
        source (WebSocket): Source WebSocket client to receive messages from.
        destination (StreamWriter): Destination TCP VNC server to send messages to.
        recording_path: Where to save the recording. If `None` then don't record.

    Returns:
        num_messages: The number of messages forwarded.
    """
    num_messages: int = 0

    try:
        while True:
            message = await source.receive_bytes()
            destination.write(message)
            await destination.drain()
            num_messages += 1
            recording_writer.record_client_bytes(message)

    except (WebSocketDisconnect, ConnectionClosed) as e:
        _log.debug(f"Websocket disconnected in forward_client_to_tcp_server: {e}")
    except asyncio.CancelledError:
        _log.debug("Task forward_client_to_tcp_server was cancelled")
    except Exception as e:
        _log.warning(f"Unexpected exception in forward_client_to_tcp_server: {e}")
    finally:
        destination.close()
        await destination.wait_closed()
        _log.debug("TCP connection closed (receive_from_websocket).")

    return num_messages


async def forward_tcp_server_to_client(
    source: StreamReader,
    destination: WebSocket,
    recording_writer: RfbRecordingWriter,
) -> int:
    """
    Forwards messages from a TCP VNC server to a WebSocket client.

    Args:
        source (StreamReader): Source TCP VNC server to receive messages from.
        destination (WebSocket): Destination WebSocket client to send messages to.
        recording_path: Where to save the recording. If `None` then don't record.

    Returns:
        num_messages: The number of messages forwarded.
    """
    num_messages: int = 0

    try:
        while True:
            message = await source.read(4096)
            if not message:
                _log.debug("TCP connection closed by VNC server.")
                break
            try:
                await destination.send_bytes(message)
            except RuntimeError as e:
                # This occurs if the application has already initiated a WebSocket close
                # and we attempt to send another message.
                if str(e) == _WEBSOCKET_CANNOT_SEND_AFTER_CLOSE_MSG:
                    _log.debug("WebSocket close already initiated; stop forwarding server->client")
                    break
                raise

            num_messages += 1
            recording_writer.record_server_bytes(message)

    except (WebSocketDisconnect, ConnectionClosed) as e:
        _log.debug(f"Websocket disconnected in forward_tcp_server_to_client: {e}")
    except asyncio.CancelledError:
        _log.debug("Task forward_tcp_server_to_client was cancelled")
    except Exception as e:
        _log.warning(f"Unexpected exception in forward_tcp_server_to_client: {e}")
    finally:
        try:
            await destination.close()
        except RuntimeError as e:
            if (
                str(e) == _WEBSOCKET_ALREADY_CLOSE_MSG
                or str(e) == _WEBSOCKET_CANNOT_SEND_AFTER_CLOSE_MSG
            ):
                _log.debug("WebSocket connection closed")
            else:
                _log.warning(f"Unexpected runtime error in forward_tcp_server_to_client: {e}")
        except Exception as e:
            _log.warning(f"Unexpected exception in forward_tcp_server_to_client: {e}")

    return num_messages


_WEBSOCKET_ALREADY_CLOSE_MSG: Final[str] = (
    "Unexpected ASGI message 'websocket.close', after sending 'websocket.close' or response already completed."
)
_WEBSOCKET_CANNOT_SEND_AFTER_CLOSE_MSG: Final[str] = (
    'Cannot call "send" once a close message has been sent.'
)
_log = logging.getLogger(__name__)

"""
This file contains the core logic for managing the VNC protocol handshake and
communication, sans IO.
"""

from __future__ import annotations

import logging
import zlib
from dataclasses import dataclass
from enum import Enum
from io import BytesIO
from typing import IO, Any

import numpy as np
from numpy._typing import NDArray
from PIL import Image as pillow
from PIL.Image import Image

from .rfb_messages import (
    ClientInit,
    ClientMessage,
    CopyRect,
    Encoding,
    FramebufferUpdate,
    FramebufferUpdateRect,
    MouseButtons,
    PixelFormat,
    PointerEvent,
    ProtocolVersion,
    PseudoCursorRect,
    PseudoExtendedDesktopSizeRect,
    PseudoLastRect,
    PseudoQemuExtendedKeyEventRect,
    PseudoQemuLedStateRect,
    QemuLedState,
    RawRect,
    Rectangle,
    SecurityType,
    ServerInit,
    ServerMessage,
    ServerSecurity,
    ServerSecurityResult,
    SetPixelFormat,
    TightRect,
    TightRectCopyFilter,
    TightRectFill,
    TightRectJpeg,
    TightRectPaletteFilter,
    parse_server_message,
)

# TODO(mcobzarenco): How to type the object returned by zlib.decompressobj()?
# `Decompress` or `_Decompress` doesn't seem to work :-/
ZlibReadStream = Any


class HandshakeState(Enum):
    """
    Represents different states in the RFB protocol handshake and communication process.
    """

    PROTOCOL_VERSION_HANDSHAKE_SERVER = 0
    PROTOCOL_VERSION_HANDSHAKE_CLIENT = 1

    SECURITY_HANDSHAKE_SERVER = 2
    SECURITY_HANDSHAKE_CLIENT = 3
    SECURITY_RESULT_SERVER = 4

    INIT_CLIENT = 5
    INIT_SERVER = 6

    CONNECTED = 7


@dataclass(init=False)
class HandshakeStateMachine:
    """
    Manages the initial state of a Remote Framebuffer Protocol (RFB) connection during
    handshake. It tracks the current state of the connection and transitions between states based
    on the messages received from the client and server.
    """

    # Represents the current state of the connection
    state: HandshakeState = HandshakeState.PROTOCOL_VERSION_HANDSHAKE_SERVER

    server_protocol_version: ProtocolVersion | None = None
    client_protocol_version: ProtocolVersion | None = None
    server_security: ServerSecurity | None = None
    security_type: SecurityType | None = None
    client_init: ClientInit | None = None
    server_init: ServerInit | None = None

    pixel_format: PixelFormat | None = None

    def __init__(self) -> None:
        pass

    def parse_client_message(self, message: IO[bytes]) -> RfbSession | None:
        """
        Processes messages from the client based on the current state. Returns an
        `RfbConnectedSession` once the connection is successfully established.
        """
        match self.state:
            case HandshakeState.PROTOCOL_VERSION_HANDSHAKE_CLIENT:
                self.client_protocol_version = ProtocolVersion.from_bytes(message)
                self.state = HandshakeState.SECURITY_HANDSHAKE_SERVER
            case HandshakeState.SECURITY_HANDSHAKE_CLIENT:
                self.security_type = SecurityType.read_from(message)
                self.state = HandshakeState.SECURITY_RESULT_SERVER
            case HandshakeState.INIT_CLIENT:
                self.client_init = ClientInit.read_from(message)
                self.state = HandshakeState.INIT_SERVER
            case HandshakeState.CONNECTED:
                return self._get_connected_session()
            case _:
                raise RuntimeError(
                    f"Unexpected client message, state: {self.state} message: {message}",
                )
        return None

    def parse_server_message(self, message: IO[bytes]) -> RfbSession | None:
        """
        Processes messages from the server based on the current state. Returns an
        `RfbConnectedSession` once the connection is successfully established.
        """

        match self.state:
            case HandshakeState.PROTOCOL_VERSION_HANDSHAKE_SERVER:
                self.server_protocol_version = ProtocolVersion.from_bytes(message)
                self.state = HandshakeState.PROTOCOL_VERSION_HANDSHAKE_CLIENT
            case HandshakeState.SECURITY_HANDSHAKE_SERVER:
                self.server_security = ServerSecurity.from_bytes(message)
                self.state = HandshakeState.SECURITY_HANDSHAKE_CLIENT
            case HandshakeState.SECURITY_RESULT_SERVER:
                ServerSecurityResult.from_bytes(message)
                self.state = HandshakeState.INIT_CLIENT
            case HandshakeState.INIT_SERVER:
                self.server_init = ServerInit.from_bytes(message)
                self.pixel_format = self.server_init.pixel_format
                self.state = HandshakeState.CONNECTED
                return self._get_connected_session()
            case HandshakeState.CONNECTED:
                return self._get_connected_session()
            case _:
                raise RuntimeError(
                    f"Unexpected server message, state: {self.state} message: {message}",
                )
        return None

    def _get_connected_session(self) -> RfbSession:
        assert (
            self.server_protocol_version is not None
            and self.client_protocol_version is not None
            and self.server_security is not None
            and self.security_type is not None
            and self.client_init is not None
            and self.server_init is not None
            and self.pixel_format is not None
        )
        return RfbSession(
            HandshakeResult(
                server_protocol_version=self.server_protocol_version,
                client_protocol_version=self.client_protocol_version,
                server_security=self.server_security,
                security_type=self.security_type,
                client_init=self.client_init,
                server_init=self.server_init,
            )
        )


@dataclass
class HandshakeResult:
    server_protocol_version: ProtocolVersion
    client_protocol_version: ProtocolVersion
    server_security: ServerSecurity
    security_type: SecurityType
    client_init: ClientInit
    server_init: ServerInit


@dataclass
class RfbSession:
    """
    Represents an established session in the RFB protocol, encapsulating the details of the
    connection and providing methods to parse client and server messages.
    """

    handshake: HandshakeResult
    framebuffer: FramebufferState
    pointer: PointerState

    def __init__(self, handshake: HandshakeResult) -> None:
        self.handshake = handshake
        self.framebuffer = FramebufferState(
            width=handshake.server_init.screen_width,
            height=handshake.server_init.screen_height,
            pixel_format=handshake.server_init.pixel_format,
        )
        self.pointer = PointerState(x=0, y=0, buttons=MouseButtons(0))

    def parse_server_message(self, message: IO[bytes]) -> ServerMessage:
        """
        Parses a server message and returns the corresponding `ServerMessage` object.

        Args:
            message: The raw bytes message from the server.

        Returns:
            The parsed `ServerMessage` object.
        """
        return parse_server_message(message, self.framebuffer._pixel_format.bytes_per_pixel())

    def handle_client_message(self, message: ClientMessage) -> None:
        """
        Processes a client message and updates the session state accordingly.

        Args:
            message: The `ClientMessage` to process.
        """
        match message:
            case SetPixelFormat(pixel_format=pixel_format):
                self.framebuffer.set_pixel_format(pixel_format)
            case PointerEvent():
                self.pointer.handle_update(message)
            case _:
                pass

    def handle_server_message(self, message: ServerMessage) -> None:
        """
        Processes a server message and updates the session state accordingly.

        Args:
            message: The `ServerMessage` to process.
        """
        match message:
            case FramebufferUpdate():
                self.framebuffer.handle_update(message)
            case _:
                pass

    def handle_framebuffer_update(self, message: FramebufferUpdate) -> None:
        self.framebuffer.handle_update(message)

    def get_image_with_cursor(self) -> Image:
        return self.framebuffer.get_image_with_cursor((self.pointer.x, self.pointer.y))

    def get_image_without_cursor(self) -> Image:
        return self.framebuffer.get_image_without_cursor()


@dataclass
class PointerState:
    x: int
    y: int
    buttons: MouseButtons

    def handle_update(self, message: PointerEvent) -> None:
        """
        Updates the pointer state based on a received `PointerEvent` message.

        Args:
            message: The `PointerEvent` containing the pointer update.
        """
        self.x = message.x
        self.y = message.y
        self.buttons = message.buttons


@dataclass(init=False)
class FramebufferState:
    _image: NDArray[np.uint8]  # (height, width, 3)
    _cursor: Image | None
    _pixel_format: PixelFormat
    _led_state: QemuLedState | None

    _zlib_streams: tuple[ZlibReadStream, ...]

    def __init__(self, width: int, height: int, pixel_format: PixelFormat) -> None:
        self._image = np.zeros(shape=(height, width, 3), dtype="u1")
        self._cursor = None
        self._pixel_format = pixel_format

        self._zlib_streams = tuple(zlib.decompressobj() for _ in range(TightRect.NUM_ZLIB_STREAMS))

    def handle_update(self, message: FramebufferUpdate) -> None:
        """
        Handles a framebuffer update message by processing each rectangle update.

        Args:
            message: The framebuffer update message.
        """
        for rectangle in message.rectangles:
            self._handle_rect(rectangle)

    def set_pixel_format(self, pixel_format: PixelFormat) -> None:
        """
        Updates the pixel format used by the framebuffer.

        Args:
            pixel_format: The new `PixelFormat` to use.
        """
        self._pixel_format = pixel_format

    def get_image_with_cursor(self, pointer_position: tuple[int, int]) -> Image:
        """
        Combines the current framebuffer with the cursor image at its current position.

        Returns:
            The combined image with cursor.
        """
        pil_image = pillow.fromarray(self._image).convert("RGBA")
        if self._cursor is not None:
            pil_image.alpha_composite(self._cursor, dest=pointer_position)
        return pil_image.convert("RGB")

    def get_image_without_cursor(self) -> Image:
        pil_image = pillow.fromarray(self._image).convert("RGBA")
        return pil_image.convert("RGB")

    def _handle_rect(self, rect: FramebufferUpdateRect) -> None:
        """
        Processes different types of rectangles in a framebuffer update.

        Args:
            rect: The rectangle to process.
        """
        match rect:
            case RawRect():
                self._handle_raw_rect(rect)
            case CopyRect():
                self._handle_copy_rect(rect)
            case TightRect():
                self._handle_tight_rect(rect)
            case PseudoCursorRect():
                self._handle_cursor_rect(rect)
            case PseudoQemuLedStateRect(state=state):
                self._led_state = state
            case (
                PseudoExtendedDesktopSizeRect()
                | PseudoLastRect()
                | PseudoQemuExtendedKeyEventRect()
            ):
                pass
            case _:
                raise RuntimeError(f"Unexpected rectangle type {rect}")

    def _handle_raw_rect(self, rect: RawRect) -> None:
        """
        Handles a raw rectangle update, updating the framebuffer with the raw pixel data.

        Args:
            rect: The `RawRect` message containing the raw pixel data.
        """
        assert (
            self._pixel_format.bits_per_pixel == 32
            and self._pixel_format.depth == 24
            and self._pixel_format.bigendian is False
            and self._pixel_format.truecolor is True
            and self._pixel_format.redmax == 255
            and self._pixel_format.greenmax == 255
            and self._pixel_format.bluemax == 255
            and self._pixel_format.redshift == 0
            and self._pixel_format.greenshift == 8
            and self._pixel_format.blueshift == 16
        ), f"Only 24-bit RGB is supported for raw rects, pixel_format={self._pixel_format}"

        patch = _patch_coordinates(rect.patch)
        self._image[patch.y_start : patch.y_end, patch.x_start : patch.x_end] = np.frombuffer(
            buffer=rect.data,
            dtype=np.uint8,
        ).reshape(rect.patch.height, rect.patch.width, 4)[:, :, :3]

    def _handle_copy_rect(self, rect: CopyRect) -> None:
        """
        Handles a copy rectangle message, which indicates that a rectangular area of the
        framebuffer should be copied.

        Args:
            rect: The copy rectangle message.
        """
        source = _patch_coordinates(rect.patch)
        dest = _patch_coordinates(
            Rectangle(
                x=rect.source_x,
                y=rect.source_y,
                width=rect.patch.width,
                height=rect.patch.height,
                encoding=Encoding.COPY_RECTANGLE,
            )
        )

        self._image[dest.y_start : dest.y_end, dest.x_start : dest.x_end] = self._image[
            source.y_start : source.y_end, source.x_start : source.x_end
        ]

    def _handle_tight_rect(self, rect: TightRect) -> None:
        """
        Handles tight rectangle messages.

        Args:
            rect: The tight rectangle message.
        """
        patch = _patch_coordinates(rect.patch)
        new_rect: NDArray[np.uint8] | None = None

        match rect.content:
            case TightRectJpeg(data):
                new_rect = np.array(pillow.open(BytesIO(data)))
            case TightRectFill((red, green, blue)):
                new_rect = np.array((red, green, blue), dtype=np.uint8)
            case TightRectCopyFilter(stream_id, compressed_data):
                compressed_pixel_data = self._zlib_streams[stream_id].decompress(compressed_data)
                new_rect = np.frombuffer(buffer=compressed_pixel_data, dtype=np.uint8).reshape(
                    rect.patch.height, rect.patch.width, 3
                )[:, :, :3]
            case TightRectPaletteFilter():
                new_rect = self._handle_tight_rect_pallete_filter(rect.content, rect.patch)

        if new_rect is not None:
            self._image[patch.y_start : patch.y_end, patch.x_start : patch.x_end] = new_rect

    def _handle_tight_rect_pallete_filter(
        self,
        palette_filter: TightRectPaletteFilter,
        rect: Rectangle,
    ) -> NDArray[np.uint8] | None:
        raw_color_ids = palette_filter.data
        if palette_filter.compressed:
            raw_color_ids = self._zlib_streams[palette_filter.stream_id].decompress(raw_color_ids)

        color_ids = np.frombuffer(raw_color_ids, dtype=np.uint8)
        if color_ids.shape == (0,):
            _log.error(f"Encountered TightRectPaletteFilter with empty color_ids: {rect}")
            return None

        _log.debug(f"Applying PALE patch bbp={palette_filter.bits_per_pixel} {rect}")
        if palette_filter.bits_per_pixel == 1:
            color_ids = np.unpackbits(color_ids)

            # Remove padding (width is padded to be multiple of 8)
            padded_width = (rect.width + 7) // 8 * 8
            color_ids = color_ids.reshape(rect.height, padded_width)
            color_ids = color_ids[:, : rect.width]
        else:
            assert palette_filter.bits_per_pixel == 8, palette_filter.bits_per_pixel
            color_ids = color_ids.reshape(rect.height, rect.width)

        return np.array(palette_filter.palette)[color_ids].reshape(rect.height, rect.width, 3)

    def _handle_cursor_rect(self, cursor: PseudoCursorRect) -> None:
        """
        Handles cursor rectangle messages.

        Args:
            cursor: The cursor rectangle message.
        """
        number_of_pixels = cursor.patch.width * cursor.patch.height
        bytes_per_pixel = len(cursor.image) // number_of_pixels if number_of_pixels > 0 else 0
        assert bytes_per_pixel * cursor.patch.width * cursor.patch.height == len(cursor.image), (
            cursor
        )

        # You can get empty `PseudoCursorRect`s with x=0 y=0 width=0 height=0 - why?
        if number_of_pixels == 0:
            self._cursor = None
            return

        cursor_image = (
            np.frombuffer(cursor.image, dtype="u1")
            .reshape(cursor.patch.height, cursor.patch.width, bytes_per_pixel)
            .copy()
        )
        cursor_mask = np.unpackbits(np.frombuffer(cursor.mask, dtype="u1")).reshape(
            cursor.patch.height, (cursor.patch.width + 7) // 8 * 8
        )[:, : cursor.patch.width]
        cursor_image[:, :, 3] = np.where(cursor_mask[:, :], 255.0, cursor_image[:, :, 3])
        self._cursor = pillow.fromarray(cursor_image)


def _patch_coordinates(patch: Rectangle) -> _PatchCoordinates:
    x_start, y_start = patch.x, patch.y
    x_end, y_end = patch.x + patch.width, patch.y + patch.height
    return _PatchCoordinates(
        x_start=x_start,
        x_end=x_end,
        y_start=y_start,
        y_end=y_end,
    )


@dataclass(frozen=True)
class _PatchCoordinates:
    x_start: int  # u16
    x_end: int  # u16
    y_start: int  # u16
    y_end: int  # u16


_log = logging.getLogger(__name__)

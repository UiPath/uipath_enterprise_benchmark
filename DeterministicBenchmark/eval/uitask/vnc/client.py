"""
This file implements the `VncClient` class, which provides an easy-to-use interface for interacting
with a VNC server. It can be used with both WebSocket and TCP connections.

The client handles sending input events (mouse movements, clicks, keyboard input) to the server and
receiving frame updates.
"""

from __future__ import annotations

import socket
import threading
import time
from collections.abc import Iterator
from contextlib import ExitStack, contextmanager
from dataclasses import dataclass, field
from pathlib import Path
from typing import IO, Any, ClassVar, Final
from urllib.parse import urlparse

from PIL.Image import Image
from typing_extensions import override
from websockets.sync import client as ws_client

from uitask.models.display import Position, ScreenResolution
from uitask.utils import pick_free_port

from .keysymdef import X11Key
from .protocol import HandshakeResult, RfbSession
from .recording.service import VncServer
from .rfb_messages import (
    ClientInit,
    Encoding,
    FramebufferUpdate,
    FramebufferUpdateRequest,
    KeyEvent,
    MouseButtons,
    PixelFormat,
    PointerEvent,
    ProtocolVersion,
    SecurityType,
    ServerInit,
    ServerSecurity,
    ServerSecurityResult,
    SetEncodings,
    SetPixelFormat,
)

# Default WebSocket keepalive settings (seconds)
WS_PING_INTERVAL_DEFAULT: Final[float] = 20.0
WS_PING_TIMEOUT_DEFAULT: Final[float] = 10.0

# Default directory where VNC recordings are stored (overridable per call)
RECORDINGS_ROOT_DEFAULT: Final[Path] = Path(__file__).resolve().parents[2] / "vnc_recordings"


@dataclass
class VncClient:
    """
    A client for interacting with a VNC (Virtual Network Computing) server using the RFB (Remote
    Framebuffer) protocol.

    This class handles the RFB handshake process and manages the session state. It provides methods
    for moving the mouse cursor, clicking, typing text, and taking screenshots.

    Example:

    ```python
    # Connecting to a VNC server over WebSockets
    with VncClient.connect_ws("ws://localhost:5902") as client:
        client.mouse_move(100, 200)
        client.mouse_left_click()
        client.type_text("Hello, World! 你好世界 🌍")  # Now supports UTF-8!

        # Compound key support
        with client.hold_key(X11Key.Control_L):
            client.press_key(X11Key.c)

        with client.hold_keys(X11Key.Control_L, X11Key.Shift_L, X11Key.p): ...

        # Scroll wheel support
        client.mouse_scroll_up(3)  # Scroll up 3 steps
        client.mouse_scroll_down(2)  # Scroll down 2 steps

        screenshot = client.take_screenshot()
        screenshot.save("screenshot.png")

    # For video recording
    client.start_recording()  # Enable continuous framebuffer updates for recording
    client.mouse_move(100, 200)
    time.sleep(1)  # Actions are recorded as video frames
    client.mouse_left_click()
    time.sleep(1)
    client.stop_recording()  # Or automatically stopped when client closes
    ```
    """

    PROTOCOL_VERSION: ClassVar[ProtocolVersion] = ProtocolVersion(b"RFB 003.008\n")

    _stream: IO[bytes] = field(repr=False)
    _session: RfbSession

    _is_ws: bool = field(default=False, init=False)
    _vnc_server: str | None = field(default=None, init=False, repr=False)
    _recording_server: VncServer | None = field(default=None, init=False, repr=False)
    _original_is_ws: bool | None = field(default=None, init=False, repr=False)
    _original_vnc_server: str | None = field(default=None, init=False, repr=False)
    _recording_active: bool = field(default=False, init=False)
    _recording_thread: threading.Thread | None = field(default=None, init=False, repr=False)
    _stop_recording: threading.Event = field(
        default_factory=threading.Event, init=False, repr=False
    )
    _recording_interval: float = field(default=0.2, init=False)

    # Recording-related fields
    _recv_lock: threading.RLock = field(default_factory=threading.RLock, init=False, repr=False)
    _request_lock: threading.Lock = field(default_factory=threading.Lock, init=False, repr=False)
    _frame_cv: threading.Condition = field(
        default_factory=threading.Condition, init=False, repr=False
    )
    _frame_counter: int = field(default=0, init=False, repr=False)

    @classmethod
    def connect_ws(cls, uri: str, shared: bool = True) -> VncClient:
        """
        Open a VNC connection over WebSockets

        Args:
            uri: A WebSocket URI for a VNC server, e.g. ws://localhost:5902
            shared: : If True, the server should try to share the desktop by leaving other clients
                      connected.
                      If False, it should give exclusive access to this client by disconnecting all
                      others.

        Example:

        ```python
        with VncClient.connect_ws("ws://localhost:5902") as client:
            client.mouse_move(100, 200)
            client.left_click()
        ```
        """
        client = cls.create(WebsocketSyncStream.connect(uri), shared)
        client._is_ws = True
        client._vnc_server = uri
        return client

    @classmethod
    def connect_tcp(cls, host: str, port: int, shared: bool = True) -> VncClient:
        """
        Open a VNC connection over TCP

        Args:
            host: The hostname for the VNC server, e.g. localhost
            port: The port for the VNC server, e.g. 5902
            shared: : If True, the server should try to share the desktop by leaving other clients
                      connected.
                      If False, it should give exclusive access to this client by disconnecting all
                      others.

        Example:

        ```python
        with VncClient.connect_tcp("localhost", 5902) as client:
            client.mouse_move(100, 200)
            client.left_click()
        ```
        """
        client = cls.create(TcpSyncStream.connect(host, port), shared)
        client._vnc_server = f"{host}:{port}"
        return client

    @classmethod
    def create(cls, stream: IO[bytes], shared: bool = True) -> VncClient:
        """
        Create a VNC client instance after performing the RFB handshake.

        Args:
            stream: A stream object for I/O bytes communication
            shared: : If True, the server should try to share the desktop by leaving other clients
                      connected.
                      If False, it should give exclusive access to this client by disconnecting all
                      others.
        """
        # Perform RFB handshake

        # 1. Exchange protocol versions
        server_protocol_version = ProtocolVersion.from_bytes(stream)
        stream.write(cls.PROTOCOL_VERSION.to_bytes())

        # 2. Establish security type
        #
        #    Note: No VNC security protocol is supported by the client, this should be handled at a
        #          different layer, e.g. Websockets over TLS.
        server_security = ServerSecurity.from_bytes(stream)
        if SecurityType.NONE not in server_security.supported:
            raise NotImplementedError(
                f"The client only supports SecurityType.NONE; "
                f"available server security types: {server_security.supported}"
            )

        security_type = SecurityType.NONE
        security_type.write_to(stream)
        server_security_result = ServerSecurityResult.from_bytes(stream)
        assert server_security_result.success, server_security_result

        # 3. Exchange `ClientInit` and `ServerInit` messages
        client_init = ClientInit(shared)
        client_init.write_to(stream)
        server_init = ServerInit.from_bytes(stream)

        # Collect the results of the handshake and create an `RfbSession` which will handle the
        # state of the RFB protocol as we send and receive messages.
        handshake = HandshakeResult(
            server_protocol_version=server_protocol_version,
            client_protocol_version=cls.PROTOCOL_VERSION,
            server_security=server_security,
            security_type=security_type,
            client_init=client_init,
            server_init=server_init,
        )
        client = cls(_stream=stream, _session=RfbSession(handshake))

        # Set the encodings supported by the client
        client._send_message(SetPixelFormat(PixelFormat()))
        client._send_message(
            SetEncodings(
                encodings=(
                    Encoding.COPY_RECTANGLE,
                    Encoding.TIGHT,
                    Encoding.TIGHT_PNG,
                    Encoding.JPEG,
                    Encoding.JPEG_23,
                    Encoding.PSEUDO_CURSOR,
                    Encoding.PSEUDO_LAST_RECT,
                )
            )
        )
        client.take_screenshot(incremental=False)

        return client

    def get_screen_size(self) -> ScreenResolution:
        """
        Gets the size of the screen in pixels

        Returns:
            (width, height): The size of the screen in pixels
        """
        server_init = self._session.handshake.server_init
        return ScreenResolution(server_init.screen_width, server_init.screen_height)

    def get_pointer_position(self) -> Position:
        """
        Gets the current position of the mouse pointer

        Returns:
            Position: The current position of the mouse pointer
        """
        pointer = self._session.pointer
        return Position(x=pointer.x, y=pointer.y)

    def mouse_left_click(self) -> None:
        """
        Simulates a mouse left click at the current pointer location
        """
        self.mouse_click(MouseButtons.LEFT)

    def mouse_double_click(self, button: MouseButtons) -> None:
        """
        Simulates a mouse double left click at the current pointer location
        """
        self.mouse_click(button)
        self.mouse_click(button)

    def mouse_triple_click(self, button: MouseButtons) -> None:
        """
        Simulates a mouse triple left click at the current pointer location
        """
        self.mouse_click(button)
        self.mouse_click(button)
        self.mouse_click(button)

    def mouse_right_click(self) -> None:
        """
        Simulates a mouse right click at the current pointer location
        """
        self.mouse_click(MouseButtons.RIGHT)

    def mouse_scroll_up(self, repeat: int = 1) -> None:
        """
        Simulates scrolling the mouse wheel upwards

        Performs one or more upward scroll events at the current mouse position.
        Each scroll event is equivalent to one "click" of a physical mouse wheel.

        Note: According to RFB protocol, wheel up is button 4 press+release.

        Args:
            repeat: The number of scroll events to generate. Defaults to 1.
                    Higher values will simulate faster or longer scrolling.
        """
        for _ in range(repeat):
            self._scroll_wheel_event(MouseButtons.SCROLL_UP)

    def mouse_scroll_down(self, repeat: int = 1) -> None:
        """
        Simulates scrolling the mouse wheel downwards.

        Performs one or more downward scroll events at the current mouse position.
        Each scroll event is equivalent to one "click" of a physical mouse wheel.

        Note: According to RFB protocol, wheel down is button 5 press+release.

        Args:
            repeat: The number of scroll events to generate. Defaults to 1.
                    Higher values will simulate faster or longer scrolling.
        """
        for _ in range(repeat):
            self._scroll_wheel_event(MouseButtons.SCROLL_DOWN)

    def mouse_scroll_left(self, repeat: int = 1) -> None:
        """
        Simulates horizontal scrolling to the left.

        According to RFB, horizontal wheel events are buttons 6 (left) and 7 (right).

        Args:
            repeat: Number of horizontal scroll ticks to emit.
        """
        for _ in range(repeat):
            self._scroll_wheel_event(MouseButtons.SCROLL_LEFT)

    def mouse_scroll_right(self, repeat: int = 1) -> None:
        """
        Simulates horizontal scrolling to the right.

        According to RFB, horizontal wheel events are buttons 6 (left) and 7 (right).

        Args:
            repeat: Number of horizontal scroll ticks to emit.
        """
        for _ in range(repeat):
            self._scroll_wheel_event(MouseButtons.SCROLL_RIGHT)

    def _scroll_wheel_event(self, scroll_button: MouseButtons) -> None:
        """
        Sends a scroll wheel event using the RFB protocol.

        According to RFC 6143, wheel events are represented as press+release of
        button 4 (up) or button 5 (down). This implementation uses the combined
        approach that works well with noVNC and modern VNC servers.

        Args:
            scroll_button: Either MouseButtons.SCROLL_UP or MouseButtons.SCROLL_DOWN
        """
        # Get current mouse position and button state
        pointer = self._session.pointer
        x, y = pointer.x, pointer.y
        current_buttons = pointer.buttons

        # Combine scroll with existing buttons - works well with noVNC
        # Send scroll wheel press event (combine with existing buttons)
        press_buttons = current_buttons | scroll_button
        self._send_message(PointerEvent(press_buttons, x, y))

        # Send scroll wheel release event (back to original state)
        self._send_message(PointerEvent(current_buttons, x, y))

    def mouse_click(self, button: MouseButtons) -> None:
        """
        Simulates a mouse click at the current pointer location with the provided button(s)
        """
        # Get the mouse buttons which are currently held down and the current mouse position
        buttons = self._session.pointer.buttons
        x = self._session.pointer.x
        y = self._session.pointer.y

        # Press down the button(s) which we want to click
        self._send_message(PointerEvent(buttons.down(button), x, y))

        # Release the button(s)
        self._send_message(PointerEvent(buttons.up(button), x, y))

    def mouse_button_up(self, button: MouseButtons) -> None:
        """
        Releases a mouse button (or multiple) at the current pointer location.
        """
        pointer = self._session.pointer
        self._send_message(PointerEvent(pointer.buttons.up(button), pointer.x, pointer.y))

    def mouse_button_down(self, button: MouseButtons) -> None:
        """
        Presses down a mouse button (or multiple) at the current pointer location.
        """
        pointer = self._session.pointer
        self._send_message(PointerEvent(pointer.buttons.down(button), pointer.x, pointer.y))

    def mouse_move(self, x: int, y: int) -> None:
        """
        Moves the mouse cursor to the given coordinates.

        Args:
            x: The x-coordinate where to move the cursor
            y: The y-coordinate where to move the cursor
        """
        self._send_message(PointerEvent(self._session.pointer.buttons, x, y))

    def type_text(self, text: str) -> None:
        """
        Types the given UTF-8 text by simulating key presses for each character.

        This method supports the full range of UTF-8 characters by using X11 keysym
        mappings. For characters that have explicit X11 keysym definitions, it uses
        those. For other Unicode characters, it uses the standard X11 Unicode keysym
        formula (0x01000000 + codepoint).

        Args:
            text: The UTF-8 text to type.
        """
        for char in text:
            try:
                x11_key = X11Key.from_char(char)
            except ValueError as e:
                raise ValueError(f"Cannot convert character {char!r} to X11 keysym: {e}")

            # Some VNC servers do not handle some special X11Keys correctly. So we have to manually
            # add a key-press for `Shift_L` to simulate them. See also this issue:
            # https://forum.proxmox.com/threads/unable-to-type-special-characters-symbols-in-novnc-web-console.76136/.
            if char in "~!@#$%^&*()_+:<>?|" or char in ["{", "}", '"']:
                with self.hold_key(X11Key.Shift_L):
                    self.press_key(x11_key)
                    continue

            self.press_key(x11_key)

    def press_key(self, key: X11Key) -> None:
        """
        Simulates a key press and release of a single key.

        Args:
            key: The X11Key to press.
        """
        with self.hold_key(key):
            pass

    @contextmanager
    def hold_key(self, key: X11Key) -> Iterator[None]:
        """
        Context manager that simulates holding down a key for the duration of the context.

        Args:
            key: The X11Key to hold down.
        """
        self._send_message(KeyEvent(key, is_down=True))
        try:
            yield
        finally:
            self._send_message(KeyEvent(key, is_down=False))

    @contextmanager
    def hold_keys(self, *keys: X11Key) -> Iterator[None]:
        """
        Context manager that holds down multiple keys for the duration of the context. The keys are
        pressed down in order and released in reverse order on exit.

        Args:
            *keys: The X11Keys to hold down.
        """

        with ExitStack() as stack:
            for key in keys:
                stack.enter_context(self.hold_key(key))
            yield

    def take_screenshot(self, incremental: bool = False, cursor: bool = True) -> Image:
        """
        Captures a screenshot of the current framebuffer state.

        Args:
            incremental: Boolean flag that determines whether to request only incremental
                         updates. Incremental updates are *much* more efficient.

        IMPORTANT: When incremental=True, this method may block indefinitely, i.e. until there is a
                   change to the remote framebuffer. The exact behaviour depends on the VNC server,
                   but the protocol allows for an indefinite period between a
                   FramebufferUpdateRequest and the corresponding FramebufferUpdate:

                   > If and when there are changes to the specified area of the framebuffer, the
                   > server will send a FramebufferUpdate. Note that there may be an indefinite
                   > period between the FramebufferUpdateRequest and the FramebufferUpdate.")

        Returns:
            A `PIL.Image` object representing the screenshot.
        """
        # When recording is active, let the background reader parse frames and wait for the next one
        if self._recording_active:
            update_request = FramebufferUpdateRequest(
                incremental=incremental,
                x=0,
                y=0,
                width=self._session.handshake.server_init.screen_width,
                height=self._session.handshake.server_init.screen_height,
            )
            # Serialize update requests to avoid interleaving with background loop writes
            with self._request_lock:
                self._stream.write(update_request.to_bytes())

            start_count = self._frame_counter
            # Wait until a new framebuffer update has been parsed by the background thread
            with self._frame_cv:
                while self._frame_counter == start_count:
                    self._frame_cv.wait(timeout=1.0)

            return (
                self._session.get_image_with_cursor()
                if cursor
                else self._session.get_image_without_cursor()
            )

        # Not recording: perform the request and parse inline (legacy path)
        update_request = FramebufferUpdateRequest(
            incremental=incremental,
            x=0,
            y=0,
            width=self._session.handshake.server_init.screen_width,
            height=self._session.handshake.server_init.screen_height,
        )
        self._stream.write(update_request.to_bytes())
        while True:
            with self._recv_lock:
                message = self._session.parse_server_message(self._stream)
                self._session.handle_server_message(message)
            if isinstance(message, FramebufferUpdate):
                # Notify any waiters to keep behavior consistent with recording path
                with self._frame_cv:
                    self._frame_counter += 1
                    self._frame_cv.notify_all()
                return (
                    self._session.get_image_with_cursor()
                    if cursor
                    else self._session.get_image_without_cursor()
                )

    def send_event(self, event: KeyEvent | PointerEvent) -> None:
        """
        Send a raw keyboard or pointer event directly to the VNC server.

        This is a lower-level method that allows sending raw VNC protocol events. Most users
        should prefer the higher-level methods like mouse_move(), type_text(), etc.

        This function is useful for "replaying" a trace.

        Args:
            event: Either a KeyEvent or PointerEvent object representing the input event to send
        """
        self._send_message(event)

    def start_recording(self, output_dir: str | Path | None = None) -> None:
        """
        Start recording by launching a local VNC WebSocket proxy that records traffic,
        and reconnect this client through that proxy.

        - The proxy listens on host 127.0.0.1 and a free port.
        - The proxy forwards to the original VNC target (ws/tcp), recording the stream.
        - This client then reconnects to ws://localhost:<proxy_port>.
        """
        if self._recording_server is not None:
            return

        # Determine the original VNC host/port to forward to
        if self._vnc_server is None:
            raise RuntimeError("VNC server details are not available for recording")

        orig_host: str
        orig_port: int
        if self._is_ws:
            orig_host, orig_port = self._parse_ws_host_port(self._vnc_server)
        else:
            orig_host, orig_port = self._parse_tcp_host_port(self._vnc_server)

        recordings_root = Path(output_dir) if output_dir is not None else RECORDINGS_ROOT_DEFAULT

        # Choose a free local port for the recording proxy
        proxy_port = pick_free_port()

        # Launch the recording proxy
        self._recording_server = VncServer.create(
            host="127.0.0.1",
            port=proxy_port,
            vnc_host=orig_host,
            vnc_port=orig_port,
            output_dir=recordings_root,
        )
        self._recording_server.start()

        # Wait for proxy to be ready to accept connections
        self._wait_for_port("localhost", proxy_port, timeout_s=10.0)

        # Preserve original connection info so we can restore later
        self._original_is_ws = self._is_ws
        self._original_vnc_server = self._vnc_server

        # Reconnect this client to the local recording proxy over WebSocket
        proxy_uri = f"ws://localhost:{proxy_port}"
        new_stream = WebsocketSyncStream.connect(proxy_uri)

        # Close current stream before switching
        try:
            self._stream.close()
        except Exception:
            pass

        self._reconnect_to_stream(new_stream, shared=True)
        self._is_ws = True
        self._vnc_server = proxy_uri

        # Start background update loop so framebuffer updates are recorded by the proxy
        self._stop_recording.clear()
        self._recording_active = True
        self._recording_thread = threading.Thread(
            target=self._continuous_updates,
            daemon=True,
            name="VncRecordingUpdates",
        )
        self._recording_thread.start()

    def stop_recording(self) -> None:
        """
        Stop recording by closing the proxy connection, stopping the proxy,
        and reconnecting back to the original VNC server (ws/tcp).
        """
        # If not recording, nothing to do
        if self._recording_server is None:
            return

        # Take a final screenshot to ensure we have a final frame
        try:
            self.take_screenshot(incremental=False)
        except Exception:
            pass

        # Stop background update loop before closing the stream
        try:
            self._stop_recording.set()
            if self._recording_thread and self._recording_thread.is_alive():
                self._recording_thread.join(timeout=5.0)
        finally:
            self._recording_thread = None
            self._recording_active = False

        # Close connection to recording proxy
        try:
            self._stream.close()
        except Exception:
            pass

        # Stop proxy
        try:
            self._recording_server.stop()
        finally:
            self._recording_server = None

        # Restore original connection
        if self._original_vnc_server is None or self._original_is_ws is None:
            print("Original VNC connection info missing; cannot restore")
            raise RuntimeError("Original VNC connection info missing; cannot restore")

        if self._original_is_ws:
            new_stream = WebsocketSyncStream.connect(self._original_vnc_server)
        else:
            host, port = self._parse_tcp_host_port(self._original_vnc_server)
            new_stream = TcpSyncStream.connect(host, port)

        self._reconnect_to_stream(new_stream, shared=True)
        self._is_ws = self._original_is_ws
        self._vnc_server = self._original_vnc_server
        self._original_is_ws = None
        self._original_vnc_server = None

    def _reconnect_to_stream(self, stream: IO[bytes], shared: bool = True) -> None:
        """Reconnect this client to a new stream by performing the RFB handshake again."""
        # Perform handshake (mirrors the logic in create())
        server_protocol_version = ProtocolVersion.from_bytes(stream)
        stream.write(self.PROTOCOL_VERSION.to_bytes())

        server_security = ServerSecurity.from_bytes(stream)
        if SecurityType.NONE not in server_security.supported:
            raise NotImplementedError(
                f"The client only supports SecurityType.NONE; "
                f"available server security types: {server_security.supported}"
            )

        security_type = SecurityType.NONE
        security_type.write_to(stream)
        server_security_result = ServerSecurityResult.from_bytes(stream)
        assert server_security_result.success, server_security_result

        client_init = ClientInit(shared)
        client_init.write_to(stream)
        server_init = ServerInit.from_bytes(stream)

        handshake = HandshakeResult(
            server_protocol_version=server_protocol_version,
            client_protocol_version=self.PROTOCOL_VERSION,
            server_security=server_security,
            security_type=security_type,
            client_init=client_init,
            server_init=server_init,
        )

        # Swap underlying stream and session
        self._stream = stream
        self._session = RfbSession(handshake)

        # Re-establish encodings and capture initial frame
        self._send_message(SetPixelFormat(PixelFormat()))
        self._send_message(
            SetEncodings(
                encodings=(
                    Encoding.COPY_RECTANGLE,
                    Encoding.TIGHT,
                    Encoding.TIGHT_PNG,
                    Encoding.JPEG,
                    Encoding.JPEG_23,
                    Encoding.PSEUDO_CURSOR,
                    Encoding.PSEUDO_LAST_RECT,
                )
            )
        )
        self.take_screenshot(incremental=False)

    def _continuous_updates(self) -> None:
        """Background loop to request and parse framebuffer updates while recording is active."""
        try:
            # Request a full update first
            update_request = FramebufferUpdateRequest(
                incremental=False,
                x=0,
                y=0,
                width=self._session.handshake.server_init.screen_width,
                height=self._session.handshake.server_init.screen_height,
            )
            try:
                with self._request_lock:
                    self._stream.write(update_request.to_bytes())
            except Exception:
                return

            # Try to parse that frame
            try:
                with self._recv_lock:
                    message = self._session.parse_server_message(self._stream)
                    self._session.handle_server_message(message)
                if isinstance(message, FramebufferUpdate):
                    with self._frame_cv:
                        self._frame_counter += 1
                        self._frame_cv.notify_all()
            except Exception:
                pass

            # Then incremental updates
            while not self._stop_recording.is_set():
                try:
                    update_request = FramebufferUpdateRequest(
                        incremental=True,
                        x=0,
                        y=0,
                        width=self._session.handshake.server_init.screen_width,
                        height=self._session.handshake.server_init.screen_height,
                    )
                    with self._request_lock:
                        self._stream.write(update_request.to_bytes())

                    # Attempt to parse without blocking indefinitely
                    start_wait = time.time()
                    while not self._stop_recording.is_set():
                        ready = False
                        try:
                            ready_attr = getattr(self._stream, "read_ready", None)
                            if callable(ready_attr):
                                ready = bool(ready_attr())
                        except Exception:
                            ready = False

                        if ready:
                            with self._recv_lock:
                                try:
                                    message = self._session.parse_server_message(self._stream)
                                    self._session.handle_server_message(message)
                                    if isinstance(message, FramebufferUpdate):
                                        with self._frame_cv:
                                            self._frame_counter += 1
                                            self._frame_cv.notify_all()
                                except Exception:
                                    pass
                            break

                        if time.time() - start_wait > self._recording_interval:
                            break
                        time.sleep(self._recording_interval / 5)

                except Exception:
                    # Back off on errors, but continue until stop flag is set
                    if not self._stop_recording.is_set():
                        time.sleep(self._recording_interval)
        except Exception:
            pass

    @staticmethod
    def _parse_ws_host_port(uri: str) -> tuple[str, int]:
        parsed = urlparse(uri)
        if not parsed.hostname or not parsed.port:
            raise ValueError(f"Invalid WebSocket URI: {uri}")
        return parsed.hostname, int(parsed.port)

    @staticmethod
    def _parse_tcp_host_port(host_port: str) -> tuple[str, int]:
        if ":" not in host_port:
            raise ValueError(f"Invalid host:port string: {host_port}")
        host, port_s = host_port.rsplit(":", 1)
        return host, int(port_s)

    @staticmethod
    def _wait_for_port(host: str, port: int, timeout_s: float = 5.0) -> None:
        deadline = time.time() + timeout_s
        last_err: Exception | None = None
        while time.time() < deadline:
            try:
                with socket.create_connection((host, port), timeout=0.25):
                    return
            except Exception as e:
                last_err = e
                time.sleep(0.05)
        if last_err is not None:
            raise ConnectionError(
                f"Timed out waiting for {host}:{port} to accept connections: {last_err}"
            )

    def close(self) -> None:
        """
        Closes the underlying stream and releases resources.
        Also stops any active recording.
        """
        try:
            self.stop_recording()
        except Exception:
            pass

        try:
            self._stream.close()
        except Exception:
            pass

    def _send_message(
        self,
        message: KeyEvent | PointerEvent | SetEncodings | SetPixelFormat,
    ) -> None:
        """
        Sends a client message to the VNC server and updates the internal session state.

        This internal method handles both sending the message over the connection and
        updating the client's session state to track things like cursor position and
        button states.

        Args:
            message: The client message to send
        """
        self._stream.write(message.to_bytes())
        self._session.handle_client_message(message)

    def __enter__(self) -> VncClient:
        """Enter context management for using `with`"""
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        """Exit context management and ensure socket closure"""
        self.close()


class WebsocketSyncStream(IO[bytes]):
    """
    A synchronous WebSocket stream that implements the IO[bytes] interface.
    """

    _connection: ws_client.ClientConnection
    _buffer: bytes

    def __init__(self, connection: ws_client.ClientConnection) -> None:
        self._connection = connection
        self._buffer = b""

    @classmethod
    def connect(cls, uri: str) -> WebsocketSyncStream:
        """Open a WebSocket connection and return a WebsocketSyncStream object"""
        return cls(
            ws_client.connect(
                uri=uri,
                ping_interval=None,  # deactivate heartbeat pings
                additional_headers={
                    "Sec-WebSocket-Origin": "pf-vnc-client",
                },  # header expected by x11vnc
            )
        )

    @override
    def write(self, data: bytes) -> int:  # pyright: ignore [reportIncompatibleMethodOverride]
        """Send a binary message to the WebSocket"""
        self._connection.send(data)
        return len(data)

    @override
    def read(self, n: int = 1) -> bytes:
        """Receive exactly "n" bytes from the WebSocket"""
        # If the buffer already contains enough data, return the requested number of bytes
        if len(self._buffer) >= n:
            result, self._buffer = self._buffer[:n], self._buffer[n:]
            return result

        chunks = [self._buffer]
        bytes_collected = len(self._buffer)

        while bytes_collected < n:
            message = self._connection.recv()

            if not isinstance(message, bytes):
                raise ConnectionError("Received non-binary message")

            chunks.append(message)
            bytes_collected += len(message)

        # Combine all chunks into one
        data = b"".join(chunks)

        # Return the requested "n" bytes and store any excess in the buffer
        result, self._buffer = data[:n], data[n:]
        return result

    def read_ready(self) -> bool:
        """
        Checks if there is data available to be read from the WebSocket connection without
        blocking

        Returns:
            bool: True if there is data available to be read, False otherwise.
                  Data may be available either in the internal buffer or from the WebSocket
                  connection.
        """
        if len(self._buffer) > 0:
            return True

        try:
            message = self._connection.recv(timeout=0)
            if not isinstance(message, bytes):
                raise ConnectionError(f"Received non-binary message: {message}")

            self._buffer = message
            return len(self._buffer) > 0
        except TimeoutError:
            return False

    @override
    def close(self) -> None:
        """Close the WebSocket connection"""
        self._connection.close()

    def __enter__(self) -> WebsocketSyncStream:
        """Enter context management for using `with`"""
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        """Exit context management and ensure WebSocket closure"""
        self.close()


class TcpSyncStream(IO[bytes]):
    """
    A synchronous TCP stream class that implements the IO[bytes] interface,
    providing methods for reading and writing bytes over a TCP socket.
    """

    _connection: socket.socket

    def __init__(self, connection: socket.socket):
        self._connection = connection

    @classmethod
    def connect(cls, host: str, port: int) -> TcpSyncStream:
        """Open a socket connection and return a TcpSyncStream object"""
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            sock.connect((host, port))
        except (socket.error, socket.timeout) as e:
            sock.close()
            raise ConnectionError(f"Failed to connect to {host}:{port}: {e}")
        return cls(sock)

    @override
    def write(self, data: bytes) -> int:  # pyright: ignore [reportIncompatibleMethodOverride]
        """Send all data to the socket and return the number of bytes written"""
        try:
            self._connection.sendall(data)
            return len(data)
        except (socket.error, socket.timeout) as e:
            raise ConnectionError(f"Failed to write data: {e}")

    @override
    def read(self, n: int = 1) -> bytes:
        """Read exactly "n" bytes from the socket, blocking until all bytes are received"""
        chunks = []
        bytes_received = 0
        try:
            while bytes_received < n:
                chunk = self._connection.recv(n - bytes_received)
                if chunk == b"":  # Empty byte string indicates connection closed
                    raise ConnectionError("Socket connection closed before reading enough data")
                chunks.append(chunk)
                bytes_received += len(chunk)
            buffer = b"".join(chunks)
            assert len(buffer) == n, (len(buffer), n)
            return buffer
        except (socket.error, socket.timeout) as e:
            raise ConnectionError(f"Failed to read exactly {n} bytes: {e}")

    @override
    def close(self) -> None:
        """Close the socket connection"""
        try:
            self._connection.close()
        except socket.error as e:
            raise ConnectionError(f"Failed to close socket: {e}")

    def __enter__(self) -> TcpSyncStream:
        """Enter context management for using `with`"""
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        """Exit context management and ensure socket closure"""
        self.close()

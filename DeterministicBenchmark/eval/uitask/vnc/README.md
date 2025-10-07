## Overview

This package implements a lightweight VNC client and an end-to-end RFB recording/replay pipeline. It is built around the RFB protocol (RFC 6143) and common extensions used by x11vnc/libvncserver and noVNC. It supports connecting over TCP or WebSockets, sending pointer/keyboard input, receiving framebuffer updates, taking screenshots, and recording full sessions (bytes and timestamps) which can be replayed or post-processed into per-action screenshots + JSON/HTML.

At a glance:

- **Client**: `VncClient` handles RFB handshakes, pointer/keyboard events, screenshots, and optional recording via a local WebSocket proxy.
- **Protocol**: `protocol.py` models the RFB handshake and connected session state, decodes framebuffer updates, and composes cursor overlays.
- **Messages**: `rfb_messages.py` defines/parses RFB messages, encodings, pixel formats, and extensions (Tight, CopyRect, pseudo-encodings, QEMU extended key events).
- **X11 keysyms**: `keysymdef.py` maps X11 key symbols; the client can type full UTF‑8 using X11’s Unicode keysym fallback.
- **Recording/Replay**: `recording/*` defines an on-disk format (byte streams + timestamp streams), a parser to reconstruct frames/events, and utilities to derive higher-level actions and export a per-action screenshot report (JSON + HTML).
- **WebSocket bridge**: `ws.py` provides a small FastAPI-compatible bridge that proxies between a frontend WebSocket and a backend TCP VNC server while writing a synchronized recording.

## Key modules

### `client.py`

Implements `VncClient`, a synchronous client API over the RFB protocol with two transport backends:

- `WebsocketSyncStream` for `ws(s)://` endpoints (e.g., x11vnc via noVNC-compatible proxy)
- `TcpSyncStream` for raw TCP (`http(s)://{host}:{port}`)

Capabilities:

- **Handshake**: Negotiates RFB 003.008 (only supports `SecurityType.NONE`, TLS should be handled by the transport/proxy), sends `SetPixelFormat` and preferred `SetEncodings`.
- **Input**: `mouse_move`, `mouse_click`/`mouse_left_click`/`mouse_right_click`, `mouse_double_click`/`mouse_triple_click`, scroll in all directions, `press_key`, `hold_key(s)`, and `type_text` (UTF‑8 via X11 keysyms, including Unicode fallback at 0x01000000 + codepoint).
- **Screenshots**: `take_screenshot(incremental: bool, cursor: bool)` returns a `PIL.Image`. Incremental requests can block until the server has an update (per RFB spec).
- **State queries**: `get_screen_size()` and `get_pointer_position()` reflect the last known server state.
- **Raw events**: `send_event` allows replaying low-level `KeyEvent`/`PointerEvent`.
- **Recording**: `start_recording()` launches a local `VncServer` (FastAPI/uvicorn) that proxies to the original VNC target and writes byte/timestamp streams. The client then reconnects through this proxy and spins a background thread to continuously request/parse framebuffer updates. `stop_recording()` cleanly shuts down, restores the original connection, and leaves a recording ready for replay/export.

Notes:

- Only `SecurityType.NONE` is supported by the client; use WSS/TLS at the proxy layer if needed.
- Encodings requested include CopyRect, Tight/Tight-PNG, JPEG variants, and pseudo-encodings such as cursor and last-rect.
- The WebSocket implementation sets the `Sec-WebSocket-Origin` header as required by some x11vnc setups.

Minimal usage:

```python
from uitask.vnc import VncClient, X11Key, MouseButtons

with VncClient.connect_ws("ws://localhost:5902") as client:
    client.mouse_move(200, 300)
    client.mouse_left_click()
    client.type_text("Hello, 世界!")
    with client.hold_keys(X11Key.Control_L, X11Key.c):
        pass
    image = client.take_screenshot(incremental=False)
    image.save("screenshot.png")
```

Recording:

```python
client = VncClient.connect_tcp("localhost", 5901)
client.start_recording()           # reconnects via local proxy and records
client.mouse_scroll_down(3)
client.mouse_double_click(MouseButtons.LEFT)
client.stop_recording()            # shuts down proxy and restores original connection
client.close()
```

### `protocol.py`

Contains the RFB state machines and connected-session model:

- `HandshakeStateMachine` drives server/client handshake steps until the session is established.
- `HandshakeResult` captures negotiated parameters (protocol versions, security, pixel format, screen size).
- `RfbSession` maintains framebuffer and pointer state, parses server messages, applies updates, and can render images with or without a cursor overlay.

It decodes common rectangle encodings (Raw, CopyRect, Tight variants, including JPEG sub-encodings) using zlib and composes the framebuffer into `PIL.Image` objects. Pointer state tracks `MouseButtons` and `(x, y)` across `PointerEvent`s.

### `rfb_messages.py`

Defines the RFB wire protocol types and parsers:

- Client messages: `SetPixelFormat`, `SetEncodings`, `FramebufferUpdateRequest`, `KeyEvent`, `PointerEvent`, `ClientCutText`.
- Server messages: `FramebufferUpdate`, `SetColorMapEntries`, `Bell`, `ServerCutText`, plus extensions.
- Rect encodings for updates: `RawRect`, `CopyRect`, `TightRect` (fill/copy/palette/jpeg), and pseudo-rects like `PseudoCursorRect`, `PseudoLastRect`, `PseudoExtendedDesktopSizeRect`, and QEMU-specific events.
- Handshake: `ProtocolVersion`, `SecurityType`, `ServerSecurity`, `ServerSecurityResult`, `ClientInit`, `ServerInit`, `PixelFormat`, `Encoding`.

High-level helpers include `parse_client_message`/`parse_server_message`. The file also integrates X11 keysyms via `X11Key` for key events.

### `keysymdef.py`

Provides `X11Key`, an enumeration of X11 key symbols and utilities including `from_char` to convert a Unicode character to the appropriate X11 keysym. This enables full UTF‑8 typing. For characters without explicit keysyms, it uses the standard X11 Unicode keysym mapping (0x01000000 + codepoint).

### `ws.py`

Implements a small recording proxy and utilities:

- `VncRecorder` connects to a TCP VNC server or accepts a pre-bound socket, then bridges between a frontend `WebSocket` and backend TCP streams.
- Bidirectional forwarders (`forward_client_to_tcp_server`, `forward_tcp_server_to_client`) stream bytes and append them to an `RfbRecordingWriter` with synchronized timestamps. Clean shutdown logic handles ASGI/WebSocket close semantics.

This module is used by the local recording proxy launched from `VncClient.start_recording()`.

### `recording/replay.py`

Defines the on-disk recording format and replay machinery:

- File layout under a recording directory:
  - `client.rfb.bin` / `server.rfb.bin`: raw interleaved byte streams as sent/received
  - `client.time.bin` / `server.time.bin`: monotonic timestamp annotations (u64 nanoseconds, cumulative length)
- `RfbRecordingWriter`: thread-safe writer that records messages + timestamps.
- `RfbReplayStreams`: opens the four files and interleaves messages based on timestamps.
- `RfbReplayParser`: replays the handshake to build an `RfbSession`, then yields `RfbReplayStep` entries composed of `(timestamp, screen image, event)`; optionally includes frames on pure framebuffer updates (continuous mode) and converts QEMU extended key events into standard `KeyEvent`s.

### `recording/actions.py`

Defines higher-level semantic actions and a simple serialization layer:

- Mouse: move, click/double/triple-click, drag, scroll (with position and button masks)
- Keyboard: single key press, multi-key shortcuts (e.g., Ctrl+Shift+P), and free-form typing with full Unicode text
- `ActionReplayStep` wraps an action with a human-readable timestamp aligned to the exported video

### `recording/process_rfb.py`

Converts low-level replay events into higher-level actions and exports memory‑efficient artifacts:

- `RfbTraceToRawActionsProcessor` walks the `RfbReplayStep`s and groups raw `PointerEvent`/`KeyEvent` into actions:
  - typing sequences (with shift-aware text) and individual key presses
  - shortcuts (supports multiple shortcuts without releasing the first modifier)
  - click/double/triple-click detection (time/motion thresholds)
  - drags and scroll bursts (direction + repeat count)
- Post-processing outputs (no WebP video):
  - `action_screenshots.json`: one entry per agent action, including `action`, `params`, `task_marked_complete`, a single step `timestamp` (start), and file paths to before/after images (finish has only before)
  - `action_screenshots/`: downscaled before/after images per action
  - `action_screenshots.html`: interactive viewer that reads the JSON (embedded) and shows action, params, task completion (✓/✗), and images

Notes:
- The exporter uses a two-pass streaming pipeline: builds a compact timestamp index without holding images, then extracts only the needed frames for each action. JSON is streamed to disk (no in-RAM list).
- The "after" frame uses a configurable safety delay so UI renders are captured; `wait` actions use a larger extra buffer.

### `recording/service.py`

Provides a minimal FastAPI service to expose the recording proxy. Post-processing is decoupled:

- `VncService` exposes a `websocket` endpoint that records a session into `recording/{client,server}.{rfb,time}.bin` files.
- `VncServer` is a small uvicorn wrapper used by `VncClient.start_recording()`; it can be started/stopped or used as a context manager.
- Run post-processing separately via the CLI (below).

## Supported protocols and features

- **Transports**: TCP and WebSockets (synchronous client API)
- **RFB version**: 3.8 ("RFB 003.008\\n")
- **Security**: `SecurityType.NONE` only (use TLS/WSS at the proxy/layer above)
- **Encodings**: Raw, CopyRect, Tight/Tight-PNG, JPEG sub-encodings, pseudo-encodings (cursor, last-rect, etc.)
- **Keyboard**: X11 keysyms including Unicode fallback; supports QEMU extended key events during replay
- **Pointer**: Full button mask support (including wheel and horizontal scroll) with composable up/down
- **Screenshots**: Cursor overlay optional; incremental updates supported
- **Recording**: Byte-accurate with nanosecond timestamps; deterministic replay and export

## Practical examples

Connect over TCP, click, and screenshot:

```python
from uitask.vnc import VncClient

with VncClient.connect_tcp("127.0.0.1", 5901) as client:
    client.mouse_move(100, 120)
    client.mouse_left_click()
    image = client.take_screenshot(incremental=True)  # waits for next change
    image.save("after-click.png")
```

Record a session (proxy) and then post-process to screenshots + JSON/HTML:

```python
from uitask.vnc import VncClient

client = VncClient.connect_ws("ws://localhost:5902")
client.start_recording()
client.type_text("find ~/Downloads")
client.mouse_scroll_down(5)
client.stop_recording()
# A recording directory is created with client/server byte + time streams.
# Then run the post‑process CLI to generate action_screenshots.json/html and images.

# CLI (process all under root):
#   uv run python -m uitask.evaluate.process_recording /path/to/root [--overwrite]

## Performance & memory efficiency

- Recording writes raw client/server streams directly to disk with synchronized timestamps (no images decoded during capture).
- Post-processing streams the replay twice (index + targeted frame extraction) and writes JSON incrementally; only the frames needed per action are decoded.
- Images are downscaled and saved as JPEG/WebP to keep disk IO modest; configurable max width and quality.
- For heavy parallel workloads, consider:
  - Rotating large `.rfb.bin`/`.time.bin` files by size
  - Streaming compression (zstd) on message files (trade CPU for IO)
  - Staggering post-processing to reduce contention
```

## Notes and limitations

- Only the `NONE` security type is supported within the client; authenticate/secure the transport externally (e.g., WSS/TLS or SSH tunnel).
- RFB has numerous extensions; this code targets the subset commonly used by x11vnc/libvncserver + noVNC. Extending support is straightforward within `rfb_messages.py` and `protocol.py`.
- `take_screenshot(incremental=True)` may block until a framebuffer update. The recording background loop is designed to keep frames flowing while capturing.
- Some VNC servers require specific WebSocket headers; `WebsocketSyncStream` sets `Sec-WebSocket-Origin` accordingly.

## File map

- `__init__.py`: re-exports `VncClient`, `X11Key`, `MouseButtons`.
- `client.py`: client API, transport streams, recording proxy integration.
- `protocol.py`: handshake/session state machines, framebuffer/pointer state, decoding.
- `rfb_messages.py`: message and encoding definitions/parsers per RFC 6143 + extensions.
- `keysymdef.py`: X11 keysyms and Unicode mapping.
- `ws.py`: WebSocket↔TCP proxying and recording writer integration.
- `recording/actions.py`: higher-level semantic action model.
- `recording/replay.py`: recording file format, replay streams/parsers, writer.
- `recording/process_rfb.py`: convert traces to actions and export per-action screenshots/report.
- `recording/service.py`: FastAPI service + uvicorn wrapper for local recording and post-processing.

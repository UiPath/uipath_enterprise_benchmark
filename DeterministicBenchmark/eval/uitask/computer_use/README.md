## Computer Use Agent Harness

This directory provides a small harness for building “computer use” agents that operate a remote desktop via VNC, record their interactions, and emit a structured action trace for evaluation.

## Agent interface (`act.py`)

The core abstraction is `Agent`, a lightweight base class you subclass to implement your automation loop.

- **Configuration fields** (dataclass init parameters):

  - `output_dir`: Where run artifacts are written (action trace, partial trace, errors, recordings)
  - `vnc_scheme`: `"ws"` or `"wss"` (default `"ws"`)
  - `vnc_host`: VNC host (default `"localhost"`)
  - `vnc_port`: VNC port (default `5902`)
  - `cdp_port`: Chrome DevTools port for DOM inspection (default `9222`)

  Note: In typical benchmarking runs, these ports are automatically allocated by the evaluation harness that launches the Dockerized desktop. Your agent should accept the provided `vnc_port` and `cdp_port` and pass them to the base `Agent`; do not hard‑code or manually allocate ports.

- **Lifecycle**:

  - VNC connection is ensured automatically before any action via `__init_subclass__` wrapping of `act()` and in `__post_init__`.
  - `run(max_steps)`: Orchestrates your agent loop.
    - Optionally starts recording (video + byte/timestamp streams)
    - Calls your `act()` up to `max_steps` times; break early by returning `True`
    - Persists `execution.json` and clears any `partial_execution.json`
    - On exceptions, writes `error.txt` and stops recording/connection cleanly

- **What you implement**:

  - `act(self) -> bool` (abstract): Perform one decision step. Return `True` when task is complete.

- **Built-in actions** (recorded via `@record_action` and executed against the VNC session):

  - `mouse_move(Position)`
  - `mouse_click(MouseClickAction)`
  - `mouse_drag(MouseDragAction)`
  - `mouse_scroll(ScrollAction)`
  - `press_keys(Sequence[str])`: Parses strings like `"Ctrl+Shift+P"`, `"alt f"`, digits, negative numbers, and individual key names to `X11Key`s
  - `type_text(str)` (full UTF‑8 via X11 keysyms)
  - `page_navigation(Literal["forward","back"])`
  - `wait(seconds: float)`
  - `finish(params: dict | None)`: Persist optional metadata about the task completion

- **Utilities**:

  - `screenshot() -> str`: Base64-encoded PNG of the current framebuffer
  - `client_resolution() -> (width, height)`
  - `check_task_success() -> bool | None`: Fetches DOM via Playwright CDP at `http(s)://{vnc_host}:{cdp_port}` and checks for a sentinel; returns `None` if not available
  - `start_recording()` / `stop_recording()`: Wrap the VNC client’s integrated recording proxy; `run()`. Recording writes raw client/server byte and time streams; post-process later to per-action screenshots.

- **Outputs written to `output_dir`**:

  - `execution.json`: Final list of recorded actions and parameters
  - `partial_execution.json`: Continuously updated during execution (useful for live debugging)
  - `error.txt`: Full traceback if an exception occurs
  - Recording artifacts (via VNC recorder): client/server byte+time streams under `recording/`
  - Post-processing artifacts (run separately): `action_screenshots.json`, `action_screenshots.html`, and images under `action_screenshots/`

### Minimal example: building your own agent

```python
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from uitask.computer_use import Agent
from uitask.models.display import Position
from uitask.models.pointer import MouseButton, MouseClickType, ScrollDirection
from uitask.tools import MouseClickAction, MouseDragAction, ScrollAction


@dataclass(kw_only=True)
class MyAgent(Agent):
    model: str
    task: str
    messages: list[dict[str, str]] = field(default_factory=list)

    def __post_init__(self) -> None:
        super().__post_init__()
        # Pseudocode: initialize your LLM client using the provided model name
        # For example:
        #   from some_llm_sdk import ChatClient
        #   self.llm = ChatClient(model=self.model)
        self.llm = ...

    def _call_llm(self, screen_b64: str) -> dict[str, Any]:
        """Pseudo LLM: return a structured plan. Replace with your own service call.

        Expected schema (example):
        {
            "action": "click" | "mouse_move" | "type_text" | "press_keys" | "scroll" | "drag" | "wait" | "page_navigation" | "finish",
            "params": {...}  # action-specific parameters
        }
        """
        prompt = {
            "role": "system",
            "content": "You are controlling a VNC desktop. Return a single action in JSON."
        }
        obs = {
            "role": "user",
            "content": f"task={self.task}; screen={screen_b64[:64]}..."
        }
        history = self.messages + [prompt, obs]
        # --- Mock LLM call ---
        resp = self.llm.chat(history)
        plan: dict[str, Any] = json.loads(extract_json(resp.content))

        # Keep a condensed transcript
        self.messages.append({"role": "assistant", "content": str(plan)})
        return plan

    def act(self) -> bool:
        # Observe environment
        screen_b64 = self.screenshot()
        plan = self._call_llm(screen_b64)

        action = str(plan.get("action", "")).lower()
        params = plan.get("params", {}) or {}

        # Map plan to harness actions
        action_map = {
            "mouse_move": lambda p: self.mouse_move(Position(*p["position"])),
            "click": lambda p: self.mouse_click(
                MouseClickAction(
                    button=MouseButton(p.get("button", "left")),
                    position=Position(*p["position"]),
                    click_type=MouseClickType(p.get("click_type", "single")),
                )
            ),
            "type_text": lambda p: self.type_text(p["text"]),
            "press_keys": lambda p: self.press_keys(p["keys"]),
            "scroll": lambda p: self.mouse_scroll(
                ScrollAction(position=Position(*p["position"]), direction=ScrollDirection(p["direction"]))
            ),
            "drag": lambda p: self.mouse_drag(
                MouseDragAction(
                    button=MouseButton(p.get("button", "left")),
                    start=Position(*p["start"]),
                    end=Position(*p["end"]),
                )
            ),
            "wait": lambda p: self.wait(float(p.get("seconds", 1.0))),
            "page_navigation": lambda p: self.page_navigation(p["direction"]),
            "finish": lambda p: self.finish(p),
        }

        if action not in action_map:
            # Fallback: avoid crashing on unknown action
            self.wait(0.5)
            return False

        action_map[action](params)
        return action == "finish"


if __name__ == "__main__":
    agent = MyAgent(task="Search and open readme", output_dir=Path("runs/my_agent"))
    agent.run(max_steps=10)
```

## Reference implementation: `byom/uipath`

See `byom/uipath/agent.py` and `byom/uipath/utils.py` for a full, production-style client that integrates an external planner (UiPath Autopilot Studio) with this harness.

Key ideas demonstrated there:

- **State management** (`ScreenplayState`):

  - Initializes with the starting screenshot and current client resolution
  - Tracks `previous_steps` (bounded deque) to provide context to the planner
  - Updates `image` after each round by calling `screenshot()`

- **Auth and environment**:

  - `generate_uipath_token(domain)` uses UiPath’s CLI OIDC flow, caches tokens under `eval/.uipath/token_{domain}.json`, and guards generation with a cross-process file lock
  - Required env vars: `UIPATH_ENV` (`alpha`|`staging`|`cloud`), `UIPATH_ORG_ID`, `UIPATH_TENANT_ID`
  - `.env` file is loaded from the `byom/uipath/` directory to simplify local development

- **Robust HTTP client**:

  - Persistent `requests.Session` with connection pooling and retry/backoff for 5xx/429 and JSON-parse errors
  - Graceful 401 handling by re-authing once and retrying immediately

- **Action loop (the `act()` method)**:

  - POSTs the current state to UiPath; receives a `ScreenplayStep` with ordered actions
  - Maps each action to this harness’s built-in methods:
    - `KEY_PRESS` → `press_keys([...])`
    - `TYPE_INTO` → `type_text(value)`
    - `CLICK` → `mouse_click(MouseClickAction(...))`
    - `WAIT` → `wait(duration)`
    - `MOUSE_MOVE` → `mouse_move(Position(...))`
    - `SCROLL` → `mouse_scroll(ScrollAction(...))`
    - `DRAG` → `mouse_drag(MouseDragAction(...))`
    - `FINISH` → `finish(params)` and return `True`
  - Records each step automatically via the `@record_action` decorator on the harness methods

- **Putting it together**:

```python
from pathlib import Path
from uitask.computer_use import UiPathScreenplay

agent = UiPathScreenplay(
    task="Fill the form and submit",
    model_name="gpt-4o",
    output_dir=Path("runs/uipath_demo"),
    vnc_host="localhost",
    vnc_port=5902,
    verbose=True,
)
agent.run(max_steps=50)
```

## Best practices for clients

- **Determinism**: Keep your `act()` pure with respect to external state; update your internal state only from screenshots, DOM, and returned action results.
- **Atomic actions**: Use the provided methods (click, type, drag, scroll, wait). They update the VNC session state and are recorded consistently.
- **Key parsing**: Prefer symbolic strings (e.g., `"Ctrl+Shift+T"`, `"enter"`, `"Digit_1"`) over raw keycodes. The harness converts them to `X11Key`s.
- **DOM checks**: If your environment exposes a CDP endpoint, `check_task_success()` can help evaluate completion; otherwise, include your own success metadata via `finish(params)` and/or customize `check_task_success()`.

## File map

- `act.py`: `Agent` base class, action wrappers, recording integration, orchestration
- `__init__.py`: Re-exports `Agent`, `UiPathScreenplay`, and trace file names
- `byom/uipath/agent.py`: UiPath-backed implementation showing stateful planning and action mapping
- `byom/uipath/utils.py`: Token generation, caching, and locking for UiPath authentication

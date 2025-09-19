from __future__ import annotations

import inspect
import json
import traceback
from abc import abstractmethod
from base64 import b64encode
from collections.abc import Callable, Sequence
from dataclasses import dataclass, field
from functools import wraps
from io import BytesIO
from pathlib import Path
from typing import Any, Concatenate, Final, Literal, ParamSpec, TypeVar

from PIL.Image import Image
from playwright.sync_api import sync_playwright

from uitask.models.display import Position
from uitask.tools import (
    MouseClickAction,
    MouseClickTool,
    MouseDragAction,
    MouseDragTool,
    MouseMoveTool,
    PageNavigationDirection,
    PageNavigationTool,
    PressKeyTool,
    ScrollAction,
    ScrollTool,
    TypeTextTool,
    WaitTool,
)
from uitask.utils import to_jsonable
from uitask.vnc import VncClient, X11Key

EXECUTION_FILE: Final[str] = "execution.json"
PARTIAL_EXECUTION_FILE: Final[str] = "partial_execution.json"
ERROR_FILE: Final[str] = "error.txt"

P = ParamSpec("P")
R = TypeVar("R")


def record_action(
    func: Callable[Concatenate[Agent, P], R],
) -> Callable[Concatenate[Agent, P], R]:
    """Wrapper function to perform the action and record it."""

    @wraps(func)
    def wrapper(self: Agent, *args: P.args, **kwargs: P.kwargs) -> R:
        bound = inspect.signature(func).bind(self, *args, **kwargs)
        bound.apply_defaults()
        params = dict(list(bound.arguments.items())[1:])
        try:
            action_result = func(self, *args, **kwargs)
        except Exception:
            self._add_action_to_history(
                action=func.__name__,
                params=to_jsonable(params),
            )
            raise
        else:
            self._add_action_to_history(
                action=func.__name__,
                params=to_jsonable(params),
            )
            return action_result

    return wrapper


@dataclass
class Agent:
    output_dir: Path
    vnc_scheme: str = "ws"
    vnc_host: str = "localhost"
    vnc_port: int = 5902
    cdp_port: int = 9222

    _action_history: list[dict[str, Any]] = field(default_factory=list, init=False)
    _vnc_client_connected: bool = field(default=False, init=False, repr=False)
    _recording_started: bool = field(default=False, init=False, repr=False)
    _vnc_client: VncClient = field(init=False, repr=False)
    _record: bool = field(init=False, repr=False)

    def __post_init__(self) -> None:
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self._ensure_vnc_client_connected()

    def __init_subclass__(cls, **kwargs: Any) -> None:
        # Wrap act method with recording checking
        if "act" in cls.__dict__:
            original_act = cls.act

            @wraps(original_act)
            def wrapped_act(self: Any, *args: Any, **kwargs: Any) -> Any:
                self._ensure_vnc_client_connected()
                return original_act(self, *args, **kwargs)

            cls.act = wrapped_act

    @property
    def action_history(self) -> list[dict[str, Any]]:
        return self._action_history

    @record_action
    def mouse_move(self, position: Position) -> None:
        MouseMoveTool().run(self._vnc_client, position)

    @record_action
    def mouse_click(self, action: MouseClickAction) -> None:
        MouseClickTool().run(self._vnc_client, action)

    @record_action
    def mouse_drag(self, action: MouseDragAction) -> None:
        MouseDragTool().run(self._vnc_client, action)

    @record_action
    def mouse_scroll(self, action: ScrollAction) -> None:
        ScrollTool().run(self._vnc_client, action)

    @record_action
    def press_keys(self, keys: Sequence[str]) -> None:
        x11_keys: list[X11Key] = []
        for key in keys:
            if key:
                if "+" in key and len(key.strip()) > 1:
                    for part in key.split("+"):
                        x11_keys.append(X11Key[part.strip().lower()])
                elif key != " " and " " in key:
                    for part in key.split(" "):
                        x11_keys.append(X11Key[part.lower()])
                elif key.isdigit():
                    # Emit each numeric character individually
                    for digit in key:
                        x11_keys.append(X11Key[digit])
                elif key[0] == "-" and key[1:].isdigit():
                    x11_keys.append(X11Key["-"])
                    for digit in key[1:]:
                        x11_keys.append(X11Key[digit])
                elif key.lower() == "none":
                    continue
                else:
                    x11_keys.append(X11Key[key.lower()])

        PressKeyTool().run(self._vnc_client, x11_keys)

    @record_action
    def type_text(self, text: str) -> None:
        TypeTextTool().run(self._vnc_client, text)

    @record_action
    def page_navigation(self, direction: Literal["forward", "back"]) -> None:
        PageNavigationTool().run(self._vnc_client, PageNavigationDirection(direction))

    @record_action
    def wait(self, duration: float) -> None:
        WaitTool().run(self._vnc_client, duration)

    @record_action
    def finish(self, params: dict[str, Any] | None = None) -> None: ...

    def screenshot(self) -> str:
        return self.image_to_b64(self._vnc_client.take_screenshot())

    def client_resolution(self) -> tuple[int, int]:
        screen_dim = self._vnc_client.get_screen_size()
        return screen_dim.width, screen_dim.height

    def check_task_success(self) -> bool | None:
        scheme = "http" if self.vnc_scheme == "ws" else "https"
        html = self._get_dom_via_playwright(f"{scheme}://{self.vnc_host}:{self.cdp_port}")
        if html is None:
            return None

        return ">code#1</" in html

    @abstractmethod
    def act(self) -> bool:
        """Handle a single action. Should return True if the agent is done performing the task."""
        ...

    def run(self, max_steps: int, record: bool) -> None:
        """
        1. Starts recording if enabled
        2. Iterates over `act` for a number of steps
        3. Determines if the task succeeded and if the agent stopped after completing the task
        4. Stops recording if enabled
        """
        if record:
            self.start_recording()
        try:
            for iteration in range(max_steps):
                task_complete = self.act()
                if task_complete:
                    break

            partial_path = self.output_dir / PARTIAL_EXECUTION_FILE
            if partial_path.exists():
                partial_path.unlink()

            with open(self.output_dir / EXECUTION_FILE, "w") as f:
                json.dump(self._action_history, f)
        except (Exception, KeyboardInterrupt) as e:
            err_msg = f"Error during agent run ({type(e).__name__})"
            exception_msg = str(e).strip()
            if exception_msg:
                err_msg += f": {exception_msg}"
            print(f"\n{err_msg}")

            # Write full traceback to file for debugging
            full_trace = traceback.format_exc()
            self._stop_vnc_client()
            with open(self.output_dir / ERROR_FILE, "w") as f:
                f.write(err_msg + "\n\n" + full_trace)
        finally:
            self.stop_recording()

    def start_recording(self) -> None:
        if not self._recording_started:
            self._vnc_client.start_recording(output_dir=self.output_dir)
            self._recording_started = True

    def stop_recording(self) -> None:
        if self._recording_started:
            self._vnc_client.stop_recording()
            self._recording_started = False

    def _stop_vnc_client(self) -> None:
        if self._vnc_client_connected:
            self.stop_recording()
            self._vnc_client.close()
            self._vnc_client_connected = False
            self._recording_started = False

    def _ensure_vnc_client_connected(self) -> None:
        """Ensure the agent connection is started before executing actions."""
        if not self._vnc_client_connected:
            self._vnc_client = VncClient.connect_ws(
                f"{self.vnc_scheme}://{self.vnc_host}:{self.vnc_port}"
            )
            self._vnc_client_connected = True

    def _add_action_to_history(
        self,
        action: str,
        params: dict[str, Any],
    ) -> None:
        record: dict[str, Any] = {"action": action, "params": params}
        record["task_marked_complete"] = self.check_task_success()
        self._action_history.append(record)
        with open(self.output_dir / PARTIAL_EXECUTION_FILE, "w") as f:
            json.dump(self._action_history, f)

    @staticmethod
    def image_to_b64(img: Image) -> str:
        buffered = BytesIO()
        img.save(buffered, format=img.format or "PNG")
        return b64encode(buffered.getvalue()).decode("utf-8")

    @staticmethod
    def _get_dom_via_playwright(cdp_url: str) -> str | None:
        try:
            with sync_playwright() as p:
                browser = p.chromium.connect_over_cdp(cdp_url)
                # Grab the first page from the first context
                ctx = browser.contexts[0]
                page = ctx.pages[0]
                return page.content()
        except Exception:
            return None

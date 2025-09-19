from collections.abc import Sequence
from dataclasses import dataclass
from enum import StrEnum

from uitask.vnc import VncClient, X11Key

from .base import Tool


@dataclass(frozen=True)
class PressKeyTool(Tool[Sequence[X11Key]]):
    def name(self) -> str:
        return "press_keys"

    def description(self) -> str:
        return "Presses the given keys"

    def run(self, client: VncClient, tool_input: Sequence[X11Key]) -> None:
        with client.hold_keys(*tool_input):
            ...


@dataclass(frozen=True)
class TypeTextTool(Tool[str]):
    def name(self) -> str:
        return "type_text"

    def description(self) -> str:
        return "Enter the given UTF-8 text"

    def run(self, client: VncClient, tool_input: str) -> None:
        client.type_text(tool_input)


class PageNavigationDirection(StrEnum):
    FORWARD = "forward"
    BACK = "back"


@dataclass(frozen=True)
class PageNavigationTool(Tool[PageNavigationDirection]):
    def name(self) -> str:
        return "navigate"

    def description(self) -> str:
        return "Navigate to the given page"

    def run(self, client: VncClient, tool_input: PageNavigationDirection) -> None:
        direction = X11Key.Right if tool_input == PageNavigationDirection.FORWARD else X11Key.Left
        with client.hold_keys(X11Key.Alt_L, direction):
            ...

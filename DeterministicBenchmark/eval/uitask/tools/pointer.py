from dataclasses import dataclass

from uitask.models.display import Position
from uitask.models.pointer import MouseButton, MouseClickType, ScrollDirection
from uitask.vnc import MouseButtons, VncClient

from .base import Tool


@dataclass(frozen=True)
class MouseMoveTool(Tool[Position]):
    def name(self) -> str:
        return "mouse_move"

    def description(self) -> str:
        return (
            "Move the cursor position to (x, y) pixel coordinates, "
            "with the origin in the top left corner of the image"
        )

    def run(self, client: VncClient, tool_input: Position) -> None:
        client.mouse_move(tool_input.x, tool_input.y)


@dataclass(frozen=True)
class MouseClickAction:
    button: MouseButton
    click_type: MouseClickType = MouseClickType.SINGLE
    position: Position | None = None


@dataclass(frozen=True)
class MouseClickTool(Tool[MouseClickAction]):
    def name(self) -> str:
        return "mouse_click"

    def description(self) -> str:
        return "Clicks the specified mouse button at the current cursor position, or the specified position"

    def run(self, client: VncClient, tool_input: MouseClickAction) -> None:
        if tool_input.position is not None:
            client.mouse_move(
                tool_input.position.x,
                tool_input.position.y,
            )

        button = MouseButtons.LEFT if tool_input.button == MouseButton.LEFT else MouseButtons.RIGHT
        match tool_input.click_type:
            case MouseClickType.SINGLE:
                client.mouse_click(button=button)
            case MouseClickType.DOUBLE:
                client.mouse_double_click(button=button)
            case MouseClickType.TRIPLE:
                client.mouse_triple_click(button=button)


@dataclass(frozen=True)
class MouseDragAction:
    button: MouseButton
    start: Position
    end: Position


@dataclass(frozen=True)
class MouseDragTool(Tool[MouseDragAction]):
    def name(self) -> str:
        return "mouse_drag"

    def description(self) -> str:
        return "Clicks and drags the mouse from the start position to the end position"

    def run(self, client: VncClient, tool_input: MouseDragAction) -> None:
        button = MouseButtons.LEFT if tool_input.button == MouseButton.LEFT else MouseButtons.RIGHT
        client.mouse_move(tool_input.start.x, tool_input.start.y)
        client.mouse_button_down(button=button)
        client.mouse_move(tool_input.end.x, tool_input.end.y)
        client.mouse_button_up(button=button)


@dataclass(frozen=True)
class ScrollAction:
    position: Position
    direction: ScrollDirection
    repeat: int = 1


@dataclass(frozen=True)
class ScrollTool(Tool[ScrollAction]):
    def name(self) -> str:
        return "mouse_scroll"

    def description(self) -> str:
        return "Scroll up/down or left/right using the mouse wheel"

    def run(self, client: VncClient, tool_input: ScrollAction) -> None:
        client.mouse_move(tool_input.position.x, tool_input.position.y)
        if tool_input.direction == ScrollDirection.DOWN:
            client.mouse_scroll_down(tool_input.repeat)
        elif tool_input.direction == ScrollDirection.UP:
            client.mouse_scroll_up(tool_input.repeat)
        elif tool_input.direction == ScrollDirection.LEFT:
            client.mouse_scroll_left(tool_input.repeat)
        elif tool_input.direction == ScrollDirection.RIGHT:
            client.mouse_scroll_right(tool_input.repeat)

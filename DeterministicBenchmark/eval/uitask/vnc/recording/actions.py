from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import StrEnum
from typing import Final, Literal

from frozendict import frozendict
from typing_extensions import override

from uitask.models.display import Position, ScrollActionDirection

from ..keysymdef import X11Key
from ..rfb_messages import MouseButtons


class ActionKind(StrEnum):
    MOUSE_DRAG = "MouseDrag"
    MOUSE_CLICK = "MouseClick"
    MOUSE_DOUBLE_CLICK = "MouseDoubleClick"
    MOUSE_TRIPLE_CLICK = "MouseTripleClick"
    MOUSE_MOVE = "MouseMove"
    MOUSE_SCROLL = "MouseScroll"
    KEY_PRESS = "KeyPress"
    KEYBOARD_SHORTCUT = "KeyboardShortcut"
    SEMANTIC_CLICK = "SemanticClick"
    TYPE = "Type"


@dataclass(frozen=True)
class ActionBase(ABC):
    action_kind: ActionKind

    @abstractmethod
    def command(self) -> str: ...

    @abstractmethod
    def to_dict(self) -> dict[str, object]: ...


@dataclass(frozen=True)
class KeyPressAction(ActionBase):
    """Defines a key press action.

    This is a higher-level action than a key event. For example, a key press action could be
    pressing the "a" key, while key events would be press-down and press-up events for the "a" key.
    """

    action_kind: Literal[ActionKind.KEY_PRESS] = field(init=False, default=ActionKind.KEY_PRESS)
    key: X11Key

    @override
    def command(self) -> str:
        return f"press_key({self.key.name})"

    @override
    def to_dict(self) -> dict[str, object]:
        return {
            "kind": self.action_kind.value,
            "key": self.key.name,
        }


@dataclass(frozen=True)
class TypeAction(ActionBase):
    action_kind: Literal[ActionKind.TYPE] = field(init=False, default=ActionKind.TYPE)
    keys: list[X11Key]
    # Consolidated typed text, including full UTF-8 content when available
    text: str | None = None

    @property
    def typed_string(self) -> str:
        if self.text is not None:
            return self.text
        # Fallback for legacy recordings that only have keys.
        # This only accurately covers ASCII and a subset of punctuation.
        return "".join([_MAP_KEY_NAME_TO_CHARACTER.get(key.name, key.name) for key in self.keys])

    @override
    def command(self) -> str:
        return f'type_ascii("{self.typed_string}")'

    @override
    def to_dict(self) -> dict[str, object]:
        return {
            "kind": self.action_kind.value,
            "text": self.typed_string,
        }


@dataclass(frozen=True)
class MouseMoveAction(ActionBase):
    """Defines a mouse move action.

    This is a higher-level action than a mouse event.
    """

    action_kind: Literal[ActionKind.MOUSE_MOVE] = field(init=False, default=ActionKind.MOUSE_MOVE)
    position: Position

    @override
    def command(self) -> str:
        return f"move_mouse([{self.position.x}, {self.position.y}])"

    @override
    def to_dict(self) -> dict[str, object]:
        return {
            "kind": self.action_kind.value,
            "position": {"x": self.position.x, "y": self.position.y},
        }


@dataclass(frozen=True)
class MouseClickAction(ActionBase):
    """Defines a mouse click action.

    This is a higher-level action than a mouse event. For example, a mouse click action could be
    clicking the left mouse button, while mouse events would be press-down and press-up events for
    the left mouse button.

    The optional description field can be used to semantically describe the element that was
    clicked on.
    """

    action_kind: Literal[ActionKind.MOUSE_CLICK] = field(init=False, default=ActionKind.MOUSE_CLICK)
    buttons: MouseButtons
    position: Position

    @override
    def command(self) -> str:
        return f"click(button={self.buttons.name}, [{self.position.x}, {self.position.y}])"

    @override
    def to_dict(self) -> dict[str, object]:
        button_name = _mouse_button_to_name(self.buttons)
        return {
            "kind": self.action_kind.value,
            "button": button_name,
            "position": {"x": self.position.x, "y": self.position.y},
        }


@dataclass(frozen=True)
class MouseDoubleClickAction(ActionBase):
    action_kind: Literal[ActionKind.MOUSE_DOUBLE_CLICK] = field(
        init=False, default=ActionKind.MOUSE_DOUBLE_CLICK
    )
    buttons: MouseButtons
    position: Position

    @override
    def command(self) -> str:
        return f"double_click([{self.position.x}, {self.position.y}])"

    @override
    def to_dict(self) -> dict[str, object]:
        button_name = _mouse_button_to_name(self.buttons)
        return {
            "kind": self.action_kind.value,
            "button": button_name,
            "position": {"x": self.position.x, "y": self.position.y},
        }


@dataclass(frozen=True)
class MouseTripleClickAction(ActionBase):
    action_kind: Literal[ActionKind.MOUSE_TRIPLE_CLICK] = field(
        init=False, default=ActionKind.MOUSE_TRIPLE_CLICK
    )
    buttons: MouseButtons
    position: Position

    @override
    def command(self) -> str:
        return f"triple_click([{self.position.x}, {self.position.y}])"

    @override
    def to_dict(self) -> dict[str, object]:
        button_name = _mouse_button_to_name(self.buttons)
        return {
            "kind": self.action_kind.value,
            "button": button_name,
            "position": {"x": self.position.x, "y": self.position.y},
        }


@dataclass(frozen=True)
class MouseDragAction(ActionBase):
    action_kind: Literal[ActionKind.MOUSE_DRAG] = field(init=False, default=ActionKind.MOUSE_DRAG)
    buttons: MouseButtons
    start_x: int
    start_y: int
    end_x: int
    end_y: int

    @override
    def command(self) -> str:
        return (
            f"drag(button={self.buttons.name}, start_x={self.start_x}, start_y={self.start_y}, "
            f"end_x={self.start_x}, end_y={self.start_y})"
        )

    @override
    def to_dict(self) -> dict[str, object]:
        return {
            "kind": self.action_kind.value,
            "buttons": self.buttons.value,
            "start": {"x": self.start_x, "y": self.start_y},
            "end": {"x": self.end_x, "y": self.end_y},
        }


@dataclass(frozen=True)
class MouseScrollAction(ActionBase):
    action_kind: Literal[ActionKind.MOUSE_SCROLL] = field(
        init=False, default=ActionKind.MOUSE_SCROLL
    )
    direction: ScrollActionDirection
    num_repeats: int
    position: Position

    @override
    def command(self) -> str:
        return f"scroll({self.direction.name}, repeats={self.num_repeats})"

    @override
    def to_dict(self) -> dict[str, object]:
        return {
            "kind": self.action_kind.value,
            "direction": self.direction.value,
            "num_repeats": self.num_repeats,
            "position": {"x": self.position.x, "y": self.position.y},
        }


def _mouse_button_to_name(buttons: MouseButtons) -> str:
    """Return a stable, human-friendly name for a mouse button mask."""
    if buttons == MouseButtons.LEFT:
        return "left"
    if buttons == MouseButtons.RIGHT:
        return "right"
    if buttons == MouseButtons.MIDDLE:
        return "middle"
    if buttons == MouseButtons.SCROLL_UP:
        return "scroll_up"
    if buttons == MouseButtons.SCROLL_DOWN:
        return "scroll_down"
    # Fallbacks for uncommon masks
    try:
        name = buttons.name  # type: ignore[union-attr]
        return name.lower() if isinstance(name, str) else str(buttons.value)
    except Exception:
        return str(buttons.value)


@dataclass(frozen=True)
class KeyboardShortcutAction(ActionBase):
    action_kind: Literal[ActionKind.KEYBOARD_SHORTCUT] = field(
        init=False, default=ActionKind.KEYBOARD_SHORTCUT
    )
    keys: list[X11Key]

    @override
    def command(self) -> str:
        keys_str = " + ".join([key.name for key in self.keys])
        return f"shortcut({keys_str})"

    @override
    def to_dict(self) -> dict[str, object]:
        return {
            "kind": self.action_kind.value,
            "keys": [k.name for k in self.keys],
        }


Action = (
    KeyPressAction
    | TypeAction
    | KeyboardShortcutAction
    | MouseMoveAction
    | MouseClickAction
    | MouseDoubleClickAction
    | MouseTripleClickAction
    | MouseDragAction
    | MouseScrollAction
)


@dataclass(frozen=True)
class ActionReplayStep:
    """A replay step that can hold lower-level Rfb events and higher-level actions."""

    # Relative timestamp in format HH:MM:SS.mmm (milliseconds), aligned to video.webp
    timestamp: str
    event: Action

    def to_dict(self) -> dict[str, object]:
        return {
            "timestamp": self.timestamp,
            "event": self.event.to_dict(),
        }


_MAP_KEY_NAME_TO_CHARACTER: Final[frozendict[str, str]] = frozendict(
    {
        "space": " ",
        "exclam": "!",
        "quotedbl": '"',
        "numbersign": "#",
        "dollar": "$",
        "percent": "%",
        "ampersand": "&",
        "apostrophe": "'",
        "quoteright": "'",
        "parenleft": "(",
        "parenright": ")",
        "asterisk": "*",
        "plus": "+",
        "comma": ",",
        "minus": "-",
        "period": ".",
        "slash": "/",
        "at": "@",
        "braceleft": "{",
        "braceright": "}",
        "backslash": "\\",
        "semicolon": ";",
        "colon": ":",
        "less": "<",
        "equal": "=",
        "greater": ">",
        "question": "?",
        "Digit_0": "0",
        "Digit_1": "1",
        "Digit_2": "2",
        "Digit_3": "3",
        "Digit_4": "4",
        "Digit_5": "5",
        "Digit_6": "6",
        "Digit_7": "7",
        "Digit_8": "8",
        "Digit_9": "9",
        "bracketleft": "[",
        "bracketright": "]",
        "asciicircum": "^",
        "underscore": "_",
        "grave": "`",
        "quoteleft": "`",
        "bar": "|",
        "asciitilde": "~",
        "hyphen": "-",
        # quarantine below
        # "backspace": "\b",
        # "enter": "\n",
        # "return": "\n",
        # "delete": "\x7f",
        # "tab": "\t",
    }
)

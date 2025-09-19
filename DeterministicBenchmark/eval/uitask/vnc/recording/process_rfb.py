import json
import logging
import math
from collections.abc import Iterable, Sequence
from dataclasses import dataclass, field
from enum import IntEnum
from itertools import chain
from pathlib import Path
from typing import Any, Final, assert_never

from PIL.Image import Image

from uitask.models.display import Position, ScrollActionDirection
from uitask.models.pointer import MouseClickType

from ..keysymdef import X11Key
from ..rfb_messages import KeyEvent, MouseButtons, PointerEvent
from .actions import (
    ActionReplayStep,
    KeyboardShortcutAction,
    KeyPressAction,
    MouseClickAction,
    MouseDoubleClickAction,
    MouseDragAction,
    MouseMoveAction,
    MouseScrollAction,
    MouseTripleClickAction,
    TypeAction,
)
from .replay import RfbReplayParser, RfbReplayStep, RfbReplayStreams

WEBP_FILENAME: Final[str] = "video.webp"

# Multi-click detection: immediate back-to-back clicks, minimal movement
# Used for double-click, triple-click, and any future multi-click detection
_MULTI_CLICK_MAX_INTERVAL_NS: Final[int] = 50_000_000  # 50 ms
_MULTI_CLICK_MAX_MOVE_PX: Final[int] = 4


_MODIFIER_KEYS: Final[set[X11Key]] = {
    X11Key.Alt_L,
    X11Key.Alt_R,
    X11Key.Control_L,
    X11Key.Control_R,
    X11Key.Shift_L,
    X11Key.Shift_R,
    X11Key.function,
}

_SEMANTIC_CLICK_BUTTONS_ALLOWED = (
    MouseButtons.LEFT,
    MouseButtons.RIGHT,
)


class LastEventType(IntEnum):
    KEY_EVENT = 0
    POINTER_EVENT = 1


class CurrentMouseActionKind(IntEnum):
    MOVE = 0
    CLICK = 1
    DRAG = 2
    CLICK_OR_DBL_CLICK = 3
    CLICK_OR_DBL_CLICK_OR_DRAG = 4
    SCROLL_DOWN = 5
    SCROLL_UP = 6
    POTENTIALLY_SCROLLING_DOWN = 7
    POTENTIALLY_SCROLLING_UP = 8


@dataclass
class KeyboardState:
    keys: dict[X11Key, bool] = field(default_factory=dict)
    modifier_down: X11Key | None = None
    keys_currently_down: set[X11Key] = field(default_factory=set)

    def update(self, key: X11Key, is_down: bool) -> None:
        self.keys[key] = is_down

        if is_down:
            self.keys_currently_down.add(key)
        elif key in self.keys_currently_down:
            self.keys_currently_down.remove(key)

        if is_down and key in _MODIFIER_KEYS and self.modifier_down is None:
            self.modifier_down = key
        elif not is_down and key == self.modifier_down:
            self.modifier_down = None

    def any_key_pressed(self) -> bool:
        return len(self.keys_currently_down) > 0


@dataclass
class ShortcutState:
    keys: list[X11Key] = field(default_factory=list)
    first_modifier_step: RfbReplayStep | None = None  # TODO: Replace with timestamp
    currently_typing: bool = False

    def pop(self, key: X11Key) -> None:
        # We don't want to do an in-place `pop` because we need to save the list when shortcuts are
        # done.
        if key not in self.keys:
            _log.warning(f"Trying to pop non-existent key {key} from shortcut state.")

        self.keys = [original_key for original_key in self.keys if original_key != key]

    def is_typing_with_shift(self) -> bool:
        return (
            len(self.keys) > 1
            and self.keys[0] in {X11Key.Shift_L, X11Key.Shift_R}
            and all(
                (32 <= int(key) <= 126) or (160 <= int(key) <= 255) or (int(key) >= 0x01000000)
                for key in self.keys[1:]
            )
        )


@dataclass
class TypingState:
    keys: list[X11Key] = field(default_factory=list)
    # Accumulated text corresponding to `keys`. Supports full Unicode/UTF-8.
    text: str = ""
    start_timestamp: int | None = None


@dataclass
class CurrentMouseAction:
    kind: CurrentMouseActionKind | None = None
    start_timestamp: int | None = None


@dataclass
class MouseState:
    buttons: MouseButtons = MouseButtons(0)
    x: int | None = None
    y: int | None = None
    current_action: CurrentMouseAction = field(default_factory=CurrentMouseAction)

    def update(self, buttons: MouseButtons, x: int, y: int) -> None:
        self.buttons = buttons
        self.x = x
        self.y = y


@dataclass
class MouseClickState:
    buttons: MouseButtons = MouseButtons(0)
    num_click_events: int = 0
    last_release_timestamp_ns: int | None = None
    last_release_x: int | None = None
    last_release_y: int | None = None
    last_click_start_timestamp_ns: int | None = None


@dataclass
class MouseDragState:
    buttons: MouseButtons = MouseButtons(0)
    start_x: int | None = None
    start_y: int | None = None


@dataclass
class MouseScrollState:
    num_scroll_events: int = 0


class RfbTraceToRawActionsProcessor:
    """
    Processes a sequence of low-level Rfb events into a sequence of higher-level actions.

    This class handles:
        - Key presses
        - Key shortcuts
            - Also handles multiple shortcuts without releasing first modifier key
              (e.g., contr+c+f vs. ctrl+c +f)
        - Type actions
        - Mouse clicks
        - Mouse scrolls
        - Mouse moves

    TODO:
        - Tests (round trip from recording)
    """

    _processed_replay: list[ActionReplayStep]

    _keyboard_state: KeyboardState
    _shortcut_state: ShortcutState
    _typing_state: TypingState

    _mouse_state: MouseState

    _last_event_type: LastEventType | None
    _start_timestamp_ns: int | None

    def __init__(self, replay: Iterable[RfbReplayStep]) -> None:
        self.replay = replay

        self._processed_replay: list[ActionReplayStep] = []

        self._keyboard_state = KeyboardState()
        self._shortcut_state = ShortcutState()
        self._typing_state = TypingState()

        self._mouse_state = MouseState()
        self._mouse_click_state = MouseClickState()
        self._mouse_drag_state = MouseDragState()
        self._mouse_scroll_state = MouseScrollState()

        self._last_event_type = None
        self._start_timestamp_ns = None

    def run(self) -> list[ActionReplayStep]:
        for step in self.replay:
            if self._start_timestamp_ns is None:
                self._start_timestamp_ns = step.timestamp
            match step.event:
                case None:
                    pass

                case KeyEvent(key=key, is_down=is_down):
                    self._process_key_event(key=key, is_down=is_down, step=step)
                    self._last_event_type = LastEventType.KEY_EVENT

                case PointerEvent(buttons=buttons, x=x, y=y):
                    self._process_pointer_event(buttons=buttons, x=x, y=y, step=step)
                    self._last_event_type = LastEventType.POINTER_EVENT

        self._check_and_process_type_action()
        self._check_and_process_mouse_move_action()
        self._check_and_process_mouse_click_action()
        self._flush_pending_scroll_action()

        return self._processed_replay

    def _process_key_event(self, key: X11Key, is_down: bool, step: RfbReplayStep) -> None:
        if self._mouse_state.buttons != MouseButtons(0):
            raise ValueError("Can't do keyboard action while a mouse button is pressed.")

        self._check_and_process_mouse_move_action()
        self._check_and_process_mouse_click_action()
        # If a scroll burst was in progress, finalize it before handling keys
        self._flush_pending_scroll_action()

        if (first_modifier_key := self._keyboard_state.modifier_down) is not None:
            self._process_key_event_while_modifier_down(
                key=key,
                is_down=is_down,
                first_modifier_key=first_modifier_key,
                step=step,
            )

        elif key in _MODIFIER_KEYS:
            self._process_modifier_key_event(key=key, is_down=is_down, step=step)

        else:
            self._process_key_event_while_modifier_not_down(key=key, is_down=is_down, step=step)

        self._keyboard_state.update(key, is_down)

    def _process_key_event_while_modifier_down(
        self,
        key: X11Key,
        is_down: bool,
        first_modifier_key: X11Key,
        step: RfbReplayStep,
    ) -> None:
        if is_down:
            if self._shortcut_state.is_typing_with_shift() and key >= 127:
                self._process_type_with_shift_action()

                self._shortcut_state.keys = [self._shortcut_state.keys[0], key]
                self._shortcut_state.currently_typing = True
                self._shortcut_state.first_modifier_step = step

            else:
                if key not in self._keyboard_state.keys or not self._keyboard_state.keys[key]:
                    self._shortcut_state.keys.append(key)
                    self._shortcut_state.currently_typing = True

                else:
                    pass

        else:
            if self._shortcut_state.is_typing_with_shift():
                if key == first_modifier_key:
                    self._process_type_with_shift_action()

                    self._shortcut_state.currently_typing = False
                    self._shortcut_state.keys = []
                    self._shortcut_state.first_modifier_step = None

            else:
                if self._shortcut_state.currently_typing:
                    if key in self._shortcut_state.keys:
                        assert self._shortcut_state.first_modifier_step is not None
                        assert first_modifier_key in _MODIFIER_KEYS

                        self._processed_replay.append(
                            ActionReplayStep(
                                timestamp=self._format_relative_timestamp(
                                    self._shortcut_state.first_modifier_step.timestamp
                                ),
                                event=KeyboardShortcutAction(keys=self._shortcut_state.keys),
                            )
                        )

                        self._shortcut_state.currently_typing = False
                        self._shortcut_state.pop(key)

                elif key != first_modifier_key:
                    if key in self._shortcut_state.keys:
                        self._shortcut_state.pop(key)

                else:
                    self._shortcut_state.keys = []

    def _process_key_event_while_modifier_not_down(
        self,
        key: X11Key,
        is_down: bool,
        step: RfbReplayStep,
    ) -> None:
        if is_down:
            if self._is_printable_unicode_key(key):
                if not self._typing_state.keys:
                    self._typing_state.start_timestamp = step.timestamp

                self._typing_state.keys.append(key)
                self._typing_state.text += self._keysym_to_char(key)

            else:
                self._check_and_process_type_action()

                self._processed_replay.append(
                    ActionReplayStep(
                        timestamp=self._format_relative_timestamp(step.timestamp),
                        event=KeyPressAction(key=key),
                    )
                )

        else:
            pass

    def _process_modifier_key_event(self, key: X11Key, is_down: bool, step: RfbReplayStep) -> None:
        if is_down:
            self._check_and_process_type_action()

            self._shortcut_state.currently_typing = True
            self._shortcut_state.first_modifier_step = step
            self._shortcut_state.keys = [key]

        else:
            pass

    def _check_and_process_type_action(self) -> None:
        if self._typing_state.keys:
            if isinstance(self._processed_replay[-1].event, TypeAction):
                previous_typing_action = self._processed_replay.pop()

                assert isinstance(previous_typing_action.event, TypeAction)

                self._processed_replay.append(
                    ActionReplayStep(
                        timestamp=previous_typing_action.timestamp,
                        event=TypeAction(
                            keys=previous_typing_action.event.keys + self._typing_state.keys,
                            text=(
                                (
                                    previous_typing_action.event.text
                                    or previous_typing_action.event.typed_string
                                )
                                + self._typing_state.text
                            ),
                        ),
                    )
                )

            else:
                assert self._typing_state.start_timestamp is not None

                self._processed_replay.append(
                    ActionReplayStep(
                        timestamp=self._format_relative_timestamp(
                            self._typing_state.start_timestamp
                        ),
                        event=TypeAction(
                            keys=self._typing_state.keys, text=self._typing_state.text
                        ),
                    )
                )

            self._typing_state.keys = []
            self._typing_state.text = ""
            self._typing_state.start_timestamp = None

    def _check_and_process_type_action_at_pointer_event(self, step: RfbReplayStep) -> None:
        self._check_and_process_type_action()

        if self._last_event_type == LastEventType.KEY_EVENT:
            self._mouse_state.current_action.start_timestamp = step.timestamp

    def _process_type_with_shift_action(self) -> None:
        if isinstance(self._processed_replay[-1].event, TypeAction):
            previous_typing_action = self._processed_replay.pop()

            assert isinstance(previous_typing_action.event, TypeAction)

            self._processed_replay.append(
                ActionReplayStep(
                    timestamp=previous_typing_action.timestamp,
                    event=TypeAction(
                        keys=previous_typing_action.event.keys + self._shortcut_state.keys[1:],
                        text=(
                            (
                                previous_typing_action.event.text
                                or previous_typing_action.event.typed_string
                            )
                            + "".join(
                                self._keysym_to_char(k) for k in self._shortcut_state.keys[1:]
                            )
                        ),
                    ),
                )
            )

        else:
            assert self._shortcut_state.first_modifier_step is not None

            self._processed_replay.append(
                ActionReplayStep(
                    timestamp=self._format_relative_timestamp(
                        self._shortcut_state.first_modifier_step.timestamp
                    ),
                    event=TypeAction(
                        keys=self._shortcut_state.keys[1:],
                        text="".join(
                            self._keysym_to_char(k) for k in self._shortcut_state.keys[1:]
                        ),
                    ),
                )
            )

    def _is_printable_unicode_key(self, key: X11Key) -> bool:
        # ASCII printable (32-126), Latin-1 (160-255) and any Unicode keysym via X11 offset
        if 32 <= int(key) <= 126:
            return True
        if 160 <= int(key) <= 255:
            return True
        # Unicode via X11: 0x01000000 + codepoint, and some extended ranges in keysym tables
        return int(key) >= 0x01000000

    def _keysym_to_char(self, key: X11Key) -> str:
        value = int(key)
        # ASCII and Latin-1 direct mapping
        if 0 <= value <= 255 and value not in {8, 9, 10, 13, 127}:
            try:
                ch = bytes([value]).decode("latin1")
                # Only include printable or space
                return ch if ch.isprintable() or ch == "\n" or ch == "\t" or ch == " " else ""
            except Exception:
                return ""
        # Unicode via X11 offset
        if value >= 0x01000000:
            codepoint = value - 0x01000000
            try:
                ch = chr(codepoint)
                return ch
            except Exception:
                return ""
        # For explicit named keysyms outside ranges, ignore in text accumulation
        return ""

    def _process_pointer_event(
        self,
        buttons: MouseButtons,
        x: int,
        y: int,
        step: RfbReplayStep,
    ) -> None:
        if self._keyboard_state.any_key_pressed():
            if buttons == MouseButtons(0) and buttons == self._mouse_state.buttons:
                self._mouse_state.current_action.kind = CurrentMouseActionKind.MOVE

            else:
                raise ValueError("Can't do mouse action while a keyboard key is pressed.")

        self._check_and_process_type_action_at_pointer_event(step)

        if buttons == self._mouse_state.buttons:
            self._process_pointer_event_same_buttons(buttons)

        elif self._mouse_state.buttons == MouseButtons(0):
            self._process_pointer_event_new_button_pressed(buttons=buttons, x=x, y=y, step=step)

        elif buttons == MouseButtons(0):
            self._process_pointer_event_all_buttons_released(x=x, y=y, step=step)

        elif not math.log2(buttons.value).is_integer():
            raise ValueError("Multiple mouse buttons pressed at the same time!")

        else:
            raise ValueError(
                "We don't know how to handle relasing one mouse button and pressing another at the "
                "same time."
            )

        self._update_mouse_state(buttons=buttons, x=x, y=y, step=step)

    def _process_pointer_event_same_buttons(self, buttons: MouseButtons) -> None:
        if buttons == MouseButtons(0):
            self._check_and_process_mouse_click_action()

            # If we were potentially scrolling and a new pointer tick arrives,
            # flush the accumulated scroll before transitioning to MOVE.
            if (
                self._mouse_state.current_action.kind
                in (
                    CurrentMouseActionKind.POTENTIALLY_SCROLLING_DOWN,
                    CurrentMouseActionKind.POTENTIALLY_SCROLLING_UP,
                )
                and self._mouse_scroll_state.num_scroll_events > 0
            ):
                direction = (
                    ScrollActionDirection.DOWN
                    if self._mouse_state.current_action.kind
                    == CurrentMouseActionKind.POTENTIALLY_SCROLLING_DOWN
                    else ScrollActionDirection.UP
                )
                assert self._mouse_state.x is not None
                assert self._mouse_state.y is not None
                self._process_mouse_scroll_action(
                    direction=direction, x=self._mouse_state.x, y=self._mouse_state.y
                )

            self._mouse_state.current_action.kind = CurrentMouseActionKind.MOVE

        else:
            self._mouse_state.current_action.kind = CurrentMouseActionKind.DRAG

    def _process_pointer_event_new_button_pressed(
        self,
        buttons: MouseButtons,
        x: int,
        y: int,
        step: RfbReplayStep,
    ) -> None:
        # If there is a pending single-click candidate, decide whether to flush it now
        if self._mouse_state.current_action.kind == CurrentMouseActionKind.CLICK_OR_DBL_CLICK:
            # If button differs, moved too far, or too much time elapsed, flush as single click
            should_flush = False
            if buttons != self._mouse_click_state.buttons:
                should_flush = True
            elif self._mouse_click_state.last_release_timestamp_ns is not None:
                delta_ns = step.timestamp - self._mouse_click_state.last_release_timestamp_ns
                if delta_ns > _MULTI_CLICK_MAX_INTERVAL_NS:
                    should_flush = True
                elif (
                    self._mouse_click_state.last_release_x is not None
                    and self._mouse_click_state.last_release_y is not None
                ):
                    dx = abs(x - self._mouse_click_state.last_release_x)
                    dy = abs(y - self._mouse_click_state.last_release_y)
                    if max(dx, dy) > _MULTI_CLICK_MAX_MOVE_PX:
                        should_flush = True

            if should_flush:
                assert self._mouse_click_state.last_release_x is not None
                assert self._mouse_click_state.last_release_y is not None
                assert self._mouse_click_state.last_click_start_timestamp_ns is not None
                self._process_mouse_click_action(
                    x=self._mouse_click_state.last_release_x,
                    y=self._mouse_click_state.last_release_y,
                    click_type=MouseClickType.SINGLE,
                    start_timestamp_override=self._mouse_click_state.last_click_start_timestamp_ns,
                )

        if self._mouse_state.current_action.kind == CurrentMouseActionKind.MOVE:
            self._process_mouse_move_action(x=x, y=y, timestamp_ns=step.timestamp)

        elif (
            self._mouse_state.current_action.kind == CurrentMouseActionKind.CLICK_OR_DBL_CLICK
            and buttons != self._mouse_click_state.buttons
        ):
            self._process_mouse_click_action(x=x, y=y, click_type=MouseClickType.SINGLE)

        self._mouse_click_state.buttons = buttons

        if buttons == MouseButtons.SCROLL_DOWN:
            # Only flush if switching direction (UP -> DOWN) and there are accumulated repeats
            if (
                self._mouse_state.current_action.kind
                == CurrentMouseActionKind.POTENTIALLY_SCROLLING_UP
                and self._mouse_scroll_state.num_scroll_events > 0
            ):
                self._process_mouse_scroll_action(direction=ScrollActionDirection.UP, x=x, y=y)

            # Continue accumulating DOWN repeats (do not flush on same direction)
            self._process_pointer_event_scroll_down_button_pressed(x=x, y=y)

        elif buttons == MouseButtons.SCROLL_UP:
            # Only flush if switching direction (DOWN -> UP) and there are accumulated repeats
            if (
                self._mouse_state.current_action.kind
                == CurrentMouseActionKind.POTENTIALLY_SCROLLING_DOWN
                and self._mouse_scroll_state.num_scroll_events > 0
            ):
                self._process_mouse_scroll_action(direction=ScrollActionDirection.DOWN, x=x, y=y)

            # Continue accumulating UP repeats (do not flush on same direction)
            self._process_pointer_event_scroll_up_button_pressed(x=x, y=y)

        elif buttons in (MouseButtons.SCROLL_LEFT, MouseButtons.SCROLL_RIGHT):
            # For now, record horizontal scroll as a MouseScrollAction with LEFT/RIGHT
            # Flush any pending vertical burst first
            if (
                self._mouse_state.current_action.kind
                == CurrentMouseActionKind.POTENTIALLY_SCROLLING_DOWN
                and self._mouse_scroll_state.num_scroll_events > 0
            ):
                self._process_mouse_scroll_action(direction=ScrollActionDirection.DOWN, x=x, y=y)
            elif (
                self._mouse_state.current_action.kind
                == CurrentMouseActionKind.POTENTIALLY_SCROLLING_UP
                and self._mouse_scroll_state.num_scroll_events > 0
            ):
                self._process_mouse_scroll_action(direction=ScrollActionDirection.UP, x=x, y=y)

            # Treat each press as one horizontal tick and emit immediately
            direction = (
                ScrollActionDirection.LEFT
                if buttons == MouseButtons.SCROLL_LEFT
                else ScrollActionDirection.RIGHT
            )
            self._mouse_scroll_state.num_scroll_events = 1
            self._mouse_state.current_action.start_timestamp = step.timestamp
            self._process_mouse_scroll_action(direction=direction, x=x, y=y)
            self._mouse_state.current_action.kind = None

        else:
            # Flush any pending scroll bursts when a non-scroll button begins
            if (
                self._mouse_state.current_action.kind
                == CurrentMouseActionKind.POTENTIALLY_SCROLLING_DOWN
                and self._mouse_scroll_state.num_scroll_events > 0
            ):
                self._process_mouse_scroll_action(direction=ScrollActionDirection.DOWN, x=x, y=y)

            elif (
                self._mouse_state.current_action.kind
                == CurrentMouseActionKind.POTENTIALLY_SCROLLING_UP
                and self._mouse_scroll_state.num_scroll_events > 0
            ):
                self._process_mouse_scroll_action(direction=ScrollActionDirection.UP, x=x, y=y)

            self._mouse_state.current_action.kind = (
                CurrentMouseActionKind.CLICK_OR_DBL_CLICK_OR_DRAG
            )

            self._mouse_drag_state.buttons = buttons
            self._mouse_drag_state.start_x = x
            self._mouse_drag_state.start_y = y

        self._mouse_state.current_action.start_timestamp = step.timestamp

    def _process_pointer_event_all_buttons_released(
        self,
        x: int,
        y: int,
        step: RfbReplayStep,
    ) -> None:
        if self._mouse_state.current_action.kind == CurrentMouseActionKind.DRAG:
            self._process_mouse_drag_action(x=x, y=y)

        elif (
            self._mouse_state.current_action.kind
            == CurrentMouseActionKind.CLICK_OR_DBL_CLICK_OR_DRAG
        ):
            self._mouse_state.current_action.kind = CurrentMouseActionKind.CLICK_OR_DBL_CLICK

            if self._mouse_click_state.num_click_events == 1:
                # Second release in a sequence: check if it's a valid double-click
                is_double = False
                if self._mouse_click_state.last_release_timestamp_ns is not None:
                    delta_ns = step.timestamp - self._mouse_click_state.last_release_timestamp_ns
                    if (
                        delta_ns <= _MULTI_CLICK_MAX_INTERVAL_NS
                        and self._mouse_click_state.last_release_x is not None
                        and self._mouse_click_state.last_release_y is not None
                    ):
                        dx = abs(x - self._mouse_click_state.last_release_x)
                        dy = abs(y - self._mouse_click_state.last_release_y)
                        if max(dx, dy) <= _MULTI_CLICK_MAX_MOVE_PX:
                            is_double = True

                if is_double:
                    # Valid double-click candidate, but don't process yet - wait for potential triple
                    self._mouse_click_state.num_click_events = 2
                    self._mouse_click_state.last_release_timestamp_ns = step.timestamp
                    self._mouse_click_state.last_release_x = x
                    self._mouse_click_state.last_release_y = y
                else:
                    # Not a valid double-click: flush the previous single click and start a new sequence
                    assert self._mouse_click_state.last_release_x is not None
                    assert self._mouse_click_state.last_release_y is not None
                    assert self._mouse_click_state.last_click_start_timestamp_ns is not None
                    self._process_mouse_click_action(
                        x=self._mouse_click_state.last_release_x,
                        y=self._mouse_click_state.last_release_y,
                        click_type=MouseClickType.SINGLE,
                        start_timestamp_override=self._mouse_click_state.last_click_start_timestamp_ns,
                    )
                    # Now record this release as the first click of a new potential sequence
                    self._mouse_click_state.num_click_events = 1
                    self._mouse_click_state.last_release_timestamp_ns = step.timestamp
                    self._mouse_click_state.last_release_x = x
                    self._mouse_click_state.last_release_y = y
                    self._mouse_click_state.last_click_start_timestamp_ns = (
                        self._mouse_state.current_action.start_timestamp
                    )
                    return

            elif self._mouse_click_state.num_click_events == 2:
                # Third release in a sequence: decide if this is a triple-click
                is_triple = False
                if self._mouse_click_state.last_release_timestamp_ns is not None:
                    delta_ns = step.timestamp - self._mouse_click_state.last_release_timestamp_ns
                    if (
                        delta_ns <= _MULTI_CLICK_MAX_INTERVAL_NS
                        and self._mouse_click_state.last_release_x is not None
                        and self._mouse_click_state.last_release_y is not None
                    ):
                        dx = abs(x - self._mouse_click_state.last_release_x)
                        dy = abs(y - self._mouse_click_state.last_release_y)
                        if max(dx, dy) <= _MULTI_CLICK_MAX_MOVE_PX:
                            is_triple = True

                if is_triple:
                    self._process_mouse_click_action(x=x, y=y, click_type=MouseClickType.TRIPLE)
                else:
                    # Not a valid triple-click: flush the previous double-click and start a new sequence
                    assert self._mouse_click_state.last_release_x is not None
                    assert self._mouse_click_state.last_release_y is not None
                    assert self._mouse_click_state.last_click_start_timestamp_ns is not None
                    self._process_mouse_click_action(
                        x=self._mouse_click_state.last_release_x,
                        y=self._mouse_click_state.last_release_y,
                        click_type=MouseClickType.DOUBLE,
                        start_timestamp_override=self._mouse_click_state.last_click_start_timestamp_ns,
                    )
                    # Now record this release as the first click of a new potential sequence
                    self._mouse_click_state.num_click_events = 1
                    self._mouse_click_state.last_release_timestamp_ns = step.timestamp
                    self._mouse_click_state.last_release_x = x
                    self._mouse_click_state.last_release_y = y
                    self._mouse_click_state.last_click_start_timestamp_ns = (
                        self._mouse_state.current_action.start_timestamp
                    )
                    return

            else:
                # First release in a sequence; remember its info
                self._mouse_click_state.num_click_events = 1
                self._mouse_click_state.last_release_timestamp_ns = step.timestamp
                self._mouse_click_state.last_release_x = x
                self._mouse_click_state.last_release_y = y
                self._mouse_click_state.last_click_start_timestamp_ns = (
                    self._mouse_state.current_action.start_timestamp
                )

        elif self._mouse_state.current_action.kind == CurrentMouseActionKind.SCROLL_DOWN:
            # End of a DOWN tick; keep POTENTIALLY_SCROLLING_DOWN so repeats continue accumulating
            self._mouse_state.current_action.kind = (
                CurrentMouseActionKind.POTENTIALLY_SCROLLING_DOWN
            )
        elif self._mouse_state.current_action.kind == CurrentMouseActionKind.SCROLL_UP:
            # End of an UP tick; keep POTENTIALLY_SCROLLING_UP so repeats continue accumulating
            self._mouse_state.current_action.kind = CurrentMouseActionKind.POTENTIALLY_SCROLLING_UP

        self._mouse_state.current_action.start_timestamp = step.timestamp

    def _process_pointer_event_scroll_down_button_pressed(self, x: int, y: int) -> None:
        self._mouse_scroll_state.num_scroll_events += 1

        if (
            self._mouse_state.current_action.kind
            == CurrentMouseActionKind.POTENTIALLY_SCROLLING_DOWN
        ):
            return

        else:
            self._mouse_state.current_action.kind = CurrentMouseActionKind.SCROLL_DOWN

    def _process_pointer_event_scroll_up_button_pressed(self, x: int, y: int) -> None:
        self._mouse_scroll_state.num_scroll_events += 1

        if self._mouse_state.current_action.kind == CurrentMouseActionKind.POTENTIALLY_SCROLLING_UP:
            return

        else:
            self._mouse_state.current_action.kind = CurrentMouseActionKind.SCROLL_UP

    def _process_mouse_move_action(self, x: int, y: int, timestamp_ns: int | None = None) -> None:
        # Use provided timestamp or fall back to start_timestamp for backward compatibility
        if timestamp_ns is not None:
            ts_ns_move = timestamp_ns
        else:
            assert self._mouse_state.current_action.start_timestamp is not None
            ts_ns_move = int(self._mouse_state.current_action.start_timestamp)

        self._processed_replay.append(
            ActionReplayStep(
                timestamp=self._format_relative_timestamp(ts_ns_move),
                event=MouseMoveAction(position=Position(x=x, y=y)),
            )
        )

        self._mouse_state.current_action.kind = None

    def _check_and_process_mouse_move_action(self) -> None:
        if (
            self._mouse_state.current_action.kind == CurrentMouseActionKind.MOVE
            and not self._shortcut_state.currently_typing
        ):
            assert self._mouse_state.x is not None
            assert self._mouse_state.y is not None

            self._process_mouse_move_action(x=self._mouse_state.x, y=self._mouse_state.y)

    def _process_mouse_click_action(
        self,
        x: int,
        y: int,
        click_type: MouseClickType,
        start_timestamp_override: int | None = None,
    ) -> None:
        if click_type == MouseClickType.TRIPLE:
            action = MouseTripleClickAction
        elif click_type == MouseClickType.DOUBLE:
            action = MouseDoubleClickAction
        else:
            action = MouseClickAction

        assert (
            self._mouse_state.current_action.start_timestamp is not None
            or start_timestamp_override is not None
        )

        if start_timestamp_override is not None:
            ts_ns: int = start_timestamp_override
        else:
            assert self._mouse_state.current_action.start_timestamp is not None
            ts_ns = self._mouse_state.current_action.start_timestamp
        self._processed_replay.append(
            ActionReplayStep(
                timestamp=self._format_relative_timestamp(ts_ns),
                event=action(buttons=self._mouse_click_state.buttons, position=Position(x=x, y=y)),
            )
        )

        # Consolidate MouseMove + MouseClick if they have same position and very close timestamps
        self._consolidate_move_click_if_needed(x, y, ts_ns)

        self._mouse_state.current_action.kind = None
        self._mouse_click_state.buttons = MouseButtons(0)
        self._mouse_click_state.num_click_events = 0
        self._mouse_click_state.last_release_timestamp_ns = None
        self._mouse_click_state.last_release_x = None
        self._mouse_click_state.last_release_y = None
        self._mouse_click_state.last_click_start_timestamp_ns = None

    def _consolidate_move_click_if_needed(
        self, click_x: int, click_y: int, click_ts_ns: int
    ) -> None:
        """
        Consolidate MouseMove + MouseClick events when they have the same position and very close timestamps.

        This removes redundant MouseMove events that are immediately followed by a MouseClick
        at the same position, which typically represents a single user action.
        """
        # Need at least 2 events to potentially consolidate
        if len(self._processed_replay) < 2:
            return

        # Check if the second-to-last event is a MouseMove
        previous_action = self._processed_replay[-2]
        if not isinstance(previous_action.event, MouseMoveAction):
            return

        # Check if positions match
        move_pos = previous_action.event.position
        if move_pos.x != click_x or move_pos.y != click_y:
            return

        # Check if timestamps are very close (within 50ms)
        # Convert timestamps back to nanoseconds for comparison
        MAX_CONSOLIDATION_GAP_NS = 50_000_000  # 50ms

        # Parse the timestamp format "HH:MM:SS.mmm" back to nanoseconds
        move_timestamp_str = previous_action.timestamp
        click_timestamp_str = self._processed_replay[-1].timestamp

        # If timestamps are identical or very close, consolidate
        if move_timestamp_str == click_timestamp_str:
            # Remove the MouseMove event, keep only the MouseClick
            self._processed_replay.pop(-2)
        else:
            # For different timestamps, parse and check the time difference
            try:
                move_ns = self._parse_timestamp_to_ns(move_timestamp_str)
                click_ns = self._parse_timestamp_to_ns(click_timestamp_str)

                if abs(click_ns - move_ns) <= MAX_CONSOLIDATION_GAP_NS:
                    # Remove the MouseMove event, keep only the MouseClick
                    self._processed_replay.pop(-2)
            except (ValueError, IndexError):
                # If timestamp parsing fails, don't consolidate
                pass

    def _parse_timestamp_to_ns(self, timestamp_str: str) -> int:
        """Parse timestamp string 'HH:MM:SS.mmm' back to nanoseconds relative to start."""
        if self._start_timestamp_ns is None:
            return 0

        parts = timestamp_str.split(":")
        hours = int(parts[0])
        minutes = int(parts[1])
        sec_parts = parts[2].split(".")
        seconds = int(sec_parts[0])
        milliseconds = int(sec_parts[1])

        total_ns = (
            hours * 3600 + minutes * 60 + seconds
        ) * 1_000_000_000 + milliseconds * 1_000_000
        return total_ns

    def _check_and_process_mouse_click_action(self) -> None:
        if self._mouse_state.current_action.kind == CurrentMouseActionKind.CLICK_OR_DBL_CLICK:
            assert self._mouse_state.x is not None
            assert self._mouse_state.y is not None

            # Check if we have a pending double-click that needs to be flushed
            if self._mouse_click_state.num_click_events == 2:
                # We have a pending double-click, flush it
                assert self._mouse_click_state.last_release_x is not None
                assert self._mouse_click_state.last_release_y is not None
                self._process_mouse_click_action(
                    x=self._mouse_click_state.last_release_x,
                    y=self._mouse_click_state.last_release_y,
                    click_type=MouseClickType.DOUBLE,
                )
            else:
                # Process as single click
                self._process_mouse_click_action(
                    x=self._mouse_state.x,
                    y=self._mouse_state.y,
                    click_type=MouseClickType.SINGLE,
                )

    def _process_mouse_drag_action(self, x: int, y: int) -> None:
        assert self._mouse_state.current_action.start_timestamp is not None
        assert self._mouse_drag_state.start_x is not None
        assert self._mouse_drag_state.start_y is not None

        if (
            abs(x - self._mouse_drag_state.start_x) < 2
            and abs(y - self._mouse_drag_state.start_y) < 2
        ):
            self._processed_replay.append(
                ActionReplayStep(
                    timestamp=self._format_relative_timestamp(
                        self._mouse_state.current_action.start_timestamp
                    ),
                    event=MouseClickAction(
                        buttons=self._mouse_state.buttons,
                        position=Position(
                            x=self._mouse_drag_state.start_x,
                            y=self._mouse_drag_state.start_y,
                        ),
                    ),
                )
            )

        else:
            self._processed_replay.append(
                ActionReplayStep(
                    timestamp=self._format_relative_timestamp(
                        self._mouse_state.current_action.start_timestamp
                    ),
                    event=MouseDragAction(
                        buttons=self._mouse_state.buttons,
                        start_x=self._mouse_drag_state.start_x,
                        start_y=self._mouse_drag_state.start_y,
                        end_x=x,
                        end_y=y,
                    ),
                )
            )

        self._mouse_state.current_action.kind = None
        self._mouse_drag_state.buttons = MouseButtons(0)
        self._mouse_drag_state.start_x = None
        self._mouse_drag_state.start_y = None

    def _process_mouse_scroll_action(
        self,
        direction: ScrollActionDirection,
        x: int,
        y: int,
    ) -> None:
        assert self._mouse_state.current_action.start_timestamp is not None
        self._processed_replay.append(
            ActionReplayStep(
                timestamp=self._format_relative_timestamp(
                    self._mouse_state.current_action.start_timestamp
                ),
                event=MouseScrollAction(
                    direction=direction,
                    num_repeats=self._mouse_scroll_state.num_scroll_events,
                    position=Position(x=x, y=y),
                ),
            )
        )
        self._mouse_scroll_state.num_scroll_events = 0

    def _flush_pending_scroll_action(self) -> None:
        # Flush any pending scroll at end-of-processing
        if (
            self._mouse_scroll_state.num_scroll_events > 0
            and self._mouse_state.current_action.kind
            in (
                CurrentMouseActionKind.POTENTIALLY_SCROLLING_DOWN,
                CurrentMouseActionKind.POTENTIALLY_SCROLLING_UP,
            )
        ):
            # Guard against missing coordinates (e.g., if no pointer events yet)
            if self._mouse_state.x is None or self._mouse_state.y is None:
                return
            direction = (
                ScrollActionDirection.DOWN
                if self._mouse_state.current_action.kind
                == CurrentMouseActionKind.POTENTIALLY_SCROLLING_DOWN
                else ScrollActionDirection.UP
            )
            self._process_mouse_scroll_action(
                direction=direction, x=self._mouse_state.x, y=self._mouse_state.y
            )

    def _update_mouse_state(
        self,
        buttons: MouseButtons,
        x: int,
        y: int,
        step: RfbReplayStep,
    ) -> None:
        self._mouse_state.update(buttons=buttons, x=x, y=y)

        if self._mouse_state.current_action.start_timestamp is None:
            self._mouse_state.current_action.start_timestamp = step.timestamp

    def _format_relative_timestamp(self, timestamp_ns: int) -> str:
        base = self._start_timestamp_ns or timestamp_ns
        delta_ns = max(0, timestamp_ns - base)
        delta_ms = delta_ns // 1_000_000
        hours = (delta_ms // 3_600_000) % 100
        minutes = (delta_ms // 60_000) % 60
        seconds = (delta_ms // 1_000) % 60
        millis = delta_ms % 1_000
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}.{millis:03d}"


def _get_replay_with_raw_actions(
    replay_with_rfb: Iterable[RfbReplayStep],
) -> list[dict[str, Any]]:
    return [step.to_dict() for step in RfbTraceToRawActionsProcessor(replay_with_rfb).run()]


def _save_replay_webp(
    path: Path,
    frame_duration: int | None,
    timestamps: Sequence[int],
    images: Sequence[Image],
) -> None:
    if len(images) == 0:
        _log.warning("Trying to export an empty replay with no images")
        return

    assert len(timestamps) == len(images)

    frame_durations: int | tuple[int, ...]

    if frame_duration is None:
        action_time_diffs = (
            (end - start) // 1_000_000  # Convert nanoseconds to milliseconds
            for start, end in zip(timestamps[:-1], timestamps[1:])
        )

        # We'll display the last frame for 1 second
        frame_durations = tuple(chain(action_time_diffs, (1000,)))

    else:
        frame_durations = frame_duration

    # Export the images as an animated webp
    images[0].save(
        path,
        save_all=True,
        append_images=images[1:],
        duration=frame_durations,
        loop=0,
    )


def export_replay_as_webp(
    streams: RfbReplayStreams,
    output_prefix: Path,
    frame_duration: int | None = None,
    continuous: bool = True,
) -> None:
    """
    Exports the RFB replay as an animated WebP and a JSON file of events.

    Args:
        streams: The RFB replay streams.
        output_prefix: The prefix for the output files.
        frame_duration: The display duration of each frame in the WebP file, in milliseconds.
                        Pass a single integer for a constant duration for each frame, or None to
                        display each frame for the real amount of time it took in the recording.
        continuous: If True, save all frames including those without actions (i.e. save a movie).
                    If False, only save frames when a key or mouse event was observed.
    """
    timestamps: list[int] = []
    images: list[Image] = []
    events: list[PointerEvent | KeyEvent | None] = []
    steps: list[RfbReplayStep] = []

    replay_parser = RfbReplayParser(streams)
    for step in replay_parser.iter_steps(continuous):
        timestamps.append(step.timestamp)
        images.append(step.screen)
        events.append(step.event)
        steps.append(step)

    assert len(timestamps) == len(images) == len(events), (timestamps, images, events)

    if len(images) == 0:
        _log.warning("Trying to export an empty replay with no images or events")
        return

    _save_replay_webp(output_prefix / WEBP_FILENAME, frame_duration, timestamps, images)

    # Export the raw RFB events (pointer/key/noop)
    with open(output_prefix / "rfb_events.json", "wt") as actions_out:
        events_json = []
        for event in events:
            match event:
                case PointerEvent():
                    events_json.append({"kind": "pointer", **event.to_dict()})
                case KeyEvent():
                    events_json.append({"kind": "key", **event.to_dict()})
                case None:
                    events_json.append({"kind": "noop"})
                case _ as unreachable:
                    assert_never(unreachable)

        json.dump({"events": events_json}, actions_out)

    # Export processed high-level actions too (relative to first frame time)
    with open(output_prefix / "events.json", "wt", encoding="utf-8") as processed_out:
        json.dump(_get_replay_with_raw_actions(steps), processed_out, ensure_ascii=False)


_log = logging.getLogger(__name__)

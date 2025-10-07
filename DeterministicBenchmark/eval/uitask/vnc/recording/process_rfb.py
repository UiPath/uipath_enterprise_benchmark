import json
import logging
import math
from collections.abc import Iterable
from dataclasses import dataclass, field
from enum import IntEnum
from pathlib import Path
from typing import Any, Final

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

# Minimum delay to pick the "after" screenshot to allow UI to render (in ns)
_MIN_AFTER_DELAY_NS: Final[int] = 1_000_000_000  # 1000 ms
# Additional buffer specifically for waits (in ns)
_WAIT_AFTER_BUFFER_NS: Final[int] = 1_000_000_000  # 1000 ms

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


def _format_relative_timestamp_from_base(base_ns: int, timestamp_ns: int) -> str:
    delta_ns = max(0, timestamp_ns - base_ns)
    delta_ms = delta_ns // 1_000_000
    hours = (delta_ms // 3_600_000) % 100
    minutes = (delta_ms // 60_000) % 60
    seconds = (delta_ms // 1_000) % 60
    millis = delta_ms % 1_000
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}.{millis:03d}"


def export_action_screenshots(
    streams: RfbReplayStreams,
    output_dir: Path,
    *,
    max_output_width: int | None = 1600,
    image_format: str = "JPEG",
    image_quality: int = 80,
    inline_json: bool = True,
) -> None:
    """
    Generate a mapping from each agent action in execution.json (except finish)
    to before/after screenshots with timestamps. Stops producing video.webp and
    rfb/events jsons.

    Artifacts:
      - action_screenshots.json
      - action_screenshots/<index>_before.png, <index>_after.png
    """
    # Load reenact_execution.json if present, else execution.json
    reenact_trace = output_dir / "reenact_execution.json"
    execution_trace = output_dir / "execution.json"
    if reenact_trace.exists():
        execution_path = reenact_trace
        is_reenact = True
    elif execution_trace.exists():
        execution_path = execution_trace
        is_reenact = False
    else:
        _log.warning(
            "No execution trace found (expected reenact_execution.json or execution.json) under %s",
            output_dir,
        )
        return

    try:
        with open(execution_path, "rt", encoding="utf-8") as f:
            execution_actions: list[dict[str, Any]] = json.load(f)
    except Exception as e:
        _log.error("Failed to read execution.json: %s", e)
        return

    execution_actions = [a for a in execution_actions if a.get("action") != "finish"]

    # First pass: scan steps to establish base timestamp and collect lightweight index timeline
    replay_parser = RfbReplayParser(streams)
    base_ts_ns: int | None = None
    step_timestamps: list[int] = []
    step_kinds: list[int] = []  # 0 = fb update, 1 = event
    # Do not store images; just build a compact timeline
    for step in replay_parser.iter_steps(continuous=True):
        if base_ts_ns is None:
            base_ts_ns = step.timestamp
        step_timestamps.append(step.timestamp)
        step_kinds.append(0 if step.event is None else 1)
    if base_ts_ns is None:
        _log.warning("No replay steps; skipping action screenshot export")
        return

    # Build indices for the most recent framebuffer image before an index
    # A step with event=None corresponds to a FramebufferUpdate
    framebuffer_indices: list[int] = [i for i, kind in enumerate(step_kinds) if kind == 0]
    if not framebuffer_indices:
        framebuffer_indices = list(range(len(step_timestamps)))

    # Process raw actions to get approximate timestamps for agent operations
    # Re-run a lightweight iterator to derive processed action timestamps without keeping images
    replay_parser_actions = RfbReplayParser(streams)
    processed_actions = RfbTraceToRawActionsProcessor(
        replay_parser_actions.iter_steps(continuous=True)
    ).run()
    processed_ts_ns: list[int] = []
    for pa in processed_actions:
        # Convert relative timestamp string back to absolute ns using base
        try:
            hh, mm, rest = pa.timestamp.split(":")
            ss, mmm = rest.split(".")
            rel_ns = (int(hh) * 3600 + int(mm) * 60 + int(ss)) * 1_000_000_000 + int(
                mmm
            ) * 1_000_000
            processed_ts_ns.append(base_ts_ns + rel_ns)
        except Exception:
            # Fallback: use base
            processed_ts_ns.append(base_ts_ns)

    # Helper to find the latest framebuffer index at or before a timestamp
    def find_before_index(ts_ns: int) -> int:
        idx = 0
        # binary search over framebuffer_indices
        lo, hi = 0, len(framebuffer_indices) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if step_timestamps[framebuffer_indices[mid]] <= ts_ns:
                idx = mid
                lo = mid + 1
            else:
                hi = mid - 1
        return framebuffer_indices[idx]

    # Helper to find the first framebuffer index strictly after a timestamp
    def find_after_index(ts_ns: int) -> int:
        lo, hi = 0, len(framebuffer_indices) - 1
        ans = framebuffer_indices[-1]
        while lo <= hi:
            mid = (lo + hi) // 2
            if step_timestamps[framebuffer_indices[mid]] > ts_ns:
                ans = framebuffer_indices[mid]
                hi = mid - 1
            else:
                lo = mid + 1
        return ans

    # Prepare output dir for images
    images_dir = output_dir / "action_screenshots"
    images_dir.mkdir(parents=True, exist_ok=True)
    # Streaming JSON writer
    json_filename = "reenact_action_screenshots.json" if is_reenact else "action_screenshots.json"
    html_filename = "reenact_action_screenshots.html" if is_reenact else "action_screenshots.html"
    mapping_path = output_dir / json_filename
    out_json = open(mapping_path, "wt", encoding="utf-8")
    out_json.write("[\n")
    first_record = True
    processed_idx = 0
    last_ts_for_wait = base_ts_ns

    for i, action in enumerate(execution_actions, start=1):
        action_name = str(action.get("action", "")).strip()

        # Determine an approximate timestamp anchor for this action
        if action_name == "wait":
            duration_s = 0.0
            try:
                duration_s = float(action.get("params", {}).get("duration", 0.0))
            except Exception:
                duration_s = 0.0
            start_ts_ns = last_ts_for_wait
            end_ts_ns = start_ts_ns + int(duration_s * 1_000_000_000)
            before_idx = find_before_index(start_ts_ns)
            # For waits, still ensure we go a bit past the end to capture UI settle
            after_idx = find_after_index(end_ts_ns + _MIN_AFTER_DELAY_NS + _WAIT_AFTER_BUFFER_NS)
            last_ts_for_wait = step_timestamps[after_idx]
        else:
            if processed_idx >= len(processed_ts_ns):
                # Fallback to latest known
                start_ts_ns = last_ts_for_wait
            else:
                start_ts_ns = processed_ts_ns[processed_idx]
                processed_idx += 1
            before_idx = find_before_index(start_ts_ns)
            # pick an after index at least _MIN_AFTER_DELAY_NS after start
            after_idx = find_after_index(start_ts_ns + _MIN_AFTER_DELAY_NS)
            last_ts_for_wait = step_timestamps[after_idx]

        # Second pass: open a new parser and advance to the needed indices to grab images only
        # Grab before image
        before_ts_ns = step_timestamps[before_idx]
        after_ts_ns = step_timestamps[after_idx]

        # Extract and save only the two frames we need
        def save_frame_at(index: int, out_path: Path) -> None:
            rp = RfbReplayParser(streams)
            for i, st in enumerate(rp.iter_steps(continuous=True)):
                if i == index:
                    img = st.screen
                    if max_output_width is not None and img.width > max_output_width:
                        ratio = max_output_width / img.width
                        img = img.resize((max_output_width, max(1, int(img.height * ratio))))
                    img.save(out_path, format=image_format, quality=image_quality)
                    break

        before_name = (
            f"{i:04d}_before.jpg"
            if image_format.upper() == "JPEG"
            else f"{i:04d}_before.{image_format.lower()}"
        )
        after_name = (
            f"{i:04d}_after.jpg"
            if image_format.upper() == "JPEG"
            else f"{i:04d}_after.{image_format.lower()}"
        )
        before_path = images_dir / before_name
        after_path = images_dir / after_name

        save_frame_at(before_idx, before_path)
        save_frame_at(after_idx, after_path)

        record = {
            "index": i,
            "action": action.get("action"),
            "params": action.get("params", {}),
            "task_marked_complete": bool(action.get("task_marked_complete")),
            "before": {
                "path": str(before_path.relative_to(output_dir)),
                "timestamp_ns": before_ts_ns,
                "relative": _format_relative_timestamp_from_base(base_ts_ns, before_ts_ns),
            },
            "after": {
                "path": str(after_path.relative_to(output_dir)),
                "timestamp_ns": after_ts_ns,
                "relative": _format_relative_timestamp_from_base(base_ts_ns, after_ts_ns),
            },
        }
        if not first_record:
            out_json.write(",\n")
        out_json.write(json.dumps(record, ensure_ascii=False))
        first_record = False

    out_json.write("\n]\n")
    out_json.close()

    # Also write an HTML viewer by loading a template and injecting JSON
    try:
        if inline_json:
            # Load JSON we just wrote to embed it
            with open(mapping_path, "rt", encoding="utf-8") as f:
                mapping_results = json.load(f)
            _write_action_screenshots_html(
                output_dir=output_dir, mapping=mapping_results, output_html_filename=html_filename
            )
        else:
            # If not inlining, embed an empty array (or change template to fetch externally)
            _write_action_screenshots_html(
                output_dir=output_dir, mapping=[], output_html_filename=html_filename
            )
    except Exception as e:
        _log.error("Failed to write action_screenshots.html: %s", e)


def postprocess_output_dir(output_dir: Path) -> None:
    """
    Given an output directory containing `execution.json` and a `recording/` folder
    with client/server capture, generate `action_screenshots.json`, the
    per-action before/after images, and `action_screenshots.html`.
    """
    recording_path = output_dir / "recording"
    if not recording_path.exists():
        _log.error("Recording directory not found at %s", recording_path)
        return

    export_action_screenshots_from_path(recording_path, output_dir)


def export_action_screenshots_from_path(recording_path: Path, output_dir: Path) -> None:
    # Defaults for image export (memory-efficient settings)
    max_output_width = 1600
    image_format = "JPEG"
    image_quality = 80

    # First pass: build compact timeline (timestamps and kinds)
    step_timestamps: list[int] = []
    step_kinds: list[int] = []  # 0 = framebuffer update, 1 = event
    base_ts_ns: int | None = None
    with RfbReplayStreams.from_files(recording_path) as streams_a:
        rp_a = RfbReplayParser(streams_a)
        for st in rp_a.iter_steps(continuous=True):
            if base_ts_ns is None:
                base_ts_ns = st.timestamp
            step_timestamps.append(st.timestamp)
            step_kinds.append(0 if st.event is None else 1)
    if base_ts_ns is None:
        _log.warning("No replay steps; skipping action screenshot export")
        return

    framebuffer_indices: list[int] = [i for i, k in enumerate(step_kinds) if k == 0]
    if not framebuffer_indices:
        framebuffer_indices = list(range(len(step_timestamps)))

    # Second pass: compute processed actions to align with execution
    with RfbReplayStreams.from_files(recording_path) as streams_b:
        rp_b = RfbReplayParser(streams_b)
        processed_actions = RfbTraceToRawActionsProcessor(rp_b.iter_steps(continuous=True)).run()
    processed_ts_ns: list[int] = []
    for pa in processed_actions:
        try:
            hh, mm, rest = pa.timestamp.split(":")
            ss, mmm = rest.split(".")
            rel_ns = (int(hh) * 3600 + int(mm) * 60 + int(ss)) * 1_000_000_000 + int(
                mmm
            ) * 1_000_000
            processed_ts_ns.append(base_ts_ns + rel_ns)
        except Exception:
            processed_ts_ns.append(base_ts_ns)

    def find_before_index(ts_ns: int) -> int:
        idx = 0
        lo, hi = 0, len(framebuffer_indices) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if step_timestamps[framebuffer_indices[mid]] <= ts_ns:
                idx = mid
                lo = mid + 1
            else:
                hi = mid - 1
        return framebuffer_indices[idx]

    def find_after_index(ts_ns: int) -> int:
        lo, hi = 0, len(framebuffer_indices) - 1
        ans = framebuffer_indices[-1]
        while lo <= hi:
            mid = (lo + hi) // 2
            if step_timestamps[framebuffer_indices[mid]] > ts_ns:
                ans = framebuffer_indices[mid]
                hi = mid - 1
            else:
                lo = mid + 1
        return ans

    # Load reenact_execution.json if present, else execution.json
    reenact_trace = output_dir / "reenact_execution.json"
    execution_trace = output_dir / "execution.json"
    if reenact_trace.exists():
        execution_path = reenact_trace
        is_reenact = True
    elif execution_trace.exists():
        execution_path = execution_trace
        is_reenact = False
    else:
        _log.warning(
            "No execution trace found (expected reenact_execution.json or execution.json) under %s",
            output_dir,
        )
        return
    with open(execution_path, "rt", encoding="utf-8") as f:
        execution_actions: list[dict[str, Any]] = json.load(f)

    images_dir = output_dir / "action_screenshots"
    images_dir.mkdir(parents=True, exist_ok=True)

    json_filename = "reenact_action_screenshots.json" if is_reenact else "action_screenshots.json"
    html_filename = "reenact_action_screenshots.html" if is_reenact else "action_screenshots.html"
    mapping_path = output_dir / json_filename

    # Plan frames and JSON records
    index_to_paths: dict[int, list[Path]] = {}
    records: list[dict[str, Any]] = []

    processed_idx = 0
    last_ts_for_wait = base_ts_ns

    for i, action in enumerate(execution_actions, start=1):
        action_name = str(action.get("action", "")).strip()

        if action_name == "wait":
            try:
                duration_s = float(action.get("params", {}).get("duration", 0.0))
            except Exception:
                duration_s = 0.0
            start_ts_ns = last_ts_for_wait
            end_ts_ns = start_ts_ns + int(duration_s * 1_000_000_000)
            before_idx = find_before_index(start_ts_ns)
            after_idx = find_after_index(end_ts_ns + _MIN_AFTER_DELAY_NS + _WAIT_AFTER_BUFFER_NS)
            last_ts_for_wait = step_timestamps[after_idx]
        elif action_name == "finish":
            # Only capture a before frame for finish, no after
            start_ts_ns = last_ts_for_wait
            before_idx = find_before_index(start_ts_ns)
            after_idx = None
        else:
            if processed_idx >= len(processed_ts_ns):
                start_ts_ns = last_ts_for_wait
            else:
                start_ts_ns = processed_ts_ns[processed_idx]
                processed_idx += 1
            before_idx = find_before_index(start_ts_ns)
            after_idx = find_after_index(start_ts_ns + _MIN_AFTER_DELAY_NS)
            last_ts_for_wait = step_timestamps[after_idx]

        before_ts_ns = step_timestamps[before_idx]
        after_ts_ns = step_timestamps[after_idx] if after_idx is not None else None

        ext = "jpg" if image_format.upper() == "JPEG" else image_format.lower()
        before_name = f"{i:04d}_before.{ext}"
        before_path = images_dir / before_name
        index_to_paths.setdefault(before_idx, []).append(before_path)
        after_path: Path | None = None
        if after_idx is not None:
            after_name = f"{i:04d}_after.{ext}"
            after_path = images_dir / after_name
            index_to_paths.setdefault(after_idx, []).append(after_path)

        record: dict[str, Any] = {
            "index": i,
            "action": action.get("action"),
            "params": action.get("params", {}),
            "task_marked_complete": bool(action.get("task_marked_complete")),
            "timestamp_ns": before_ts_ns,
            "relative": _format_relative_timestamp_from_base(base_ts_ns, before_ts_ns),
            "before": {
                "path": str(before_path.relative_to(output_dir)),
            },
        }
        if after_path is not None and after_ts_ns is not None:
            record["after"] = {
                "path": str(after_path.relative_to(output_dir)),
            }
        records.append(record)

    # Single pass to save all planned frames
    with RfbReplayStreams.from_files(recording_path) as streams_c:
        rp_c = RfbReplayParser(streams_c)
        for i, st in enumerate(rp_c.iter_steps(continuous=True)):
            targets = index_to_paths.get(i)
            if not targets:
                continue
            img = st.screen
            if max_output_width is not None and img.width > max_output_width:
                ratio = max_output_width / img.width
                img = img.resize((max_output_width, max(1, int(img.height * ratio))))
            for out_path in targets:
                img.save(
                    out_path,
                    format=None if image_format.upper() == "PNG" else image_format,
                    quality=image_quality,
                )

    with open(mapping_path, "wt", encoding="utf-8") as out_json:
        json.dump(records, out_json, ensure_ascii=False, indent=2)

    try:
        _write_action_screenshots_html(
            output_dir=output_dir, mapping=records, output_html_filename=html_filename
        )
    except Exception as e:
        _log.error("Failed to write action_screenshots.html: %s", e)


def _write_action_screenshots_html(
    output_dir: Path,
    mapping: list[dict[str, Any]],
    output_html_filename: str = "action_screenshots.html",
) -> None:
    html_path = output_dir / output_html_filename
    template_path = Path(__file__).parent / "action_screenshots_template.html"
    with open(template_path, "rt", encoding="utf-8") as tpl:
        template = tpl.read()
    data_json = json.dumps(mapping, ensure_ascii=False)
    html = template.replace("__DATA_JSON__", data_json)
    with open(html_path, "wt", encoding="utf-8") as out:
        out.write(html)


_log = logging.getLogger(__name__)

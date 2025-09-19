from enum import StrEnum


class MouseButton(StrEnum):
    LEFT = "left"
    RIGHT = "right"


class MouseClickType(StrEnum):
    SINGLE = "single"
    DOUBLE = "double"
    TRIPLE = "triple"


class ScrollDirection(StrEnum):
    DOWN = "down"
    UP = "up"
    LEFT = "left"
    RIGHT = "right"

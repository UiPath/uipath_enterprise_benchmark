from dataclasses import dataclass
from enum import StrEnum


@dataclass(frozen=True)
class Position:
    """Represents a position in an image"""

    x: int
    y: int

    def __post_init__(self) -> None:
        assert 0 <= self.x and 0 <= self.y, (
            f"Attempted to build an invalid Position(x={self.x}, y={self.y}) with negative "
            f"coordinates"
        )


@dataclass(frozen=True)
class ScreenResolution:
    width: int
    height: int


class ScrollActionDirection(StrEnum):
    DOWN = "down"
    UP = "up"
    LEFT = "left"
    RIGHT = "right"

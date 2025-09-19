import time
from dataclasses import dataclass

from uitask.vnc import VncClient

from .base import Tool


@dataclass(frozen=True)
class WaitTool(Tool[float]):
    def name(self) -> str:
        return "wait"

    def description(self) -> str:
        return "Wait for the specified duration without taking any actions."

    def run(self, client: VncClient, tool_input: float) -> None:
        time.sleep(tool_input)

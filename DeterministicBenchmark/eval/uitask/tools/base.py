from __future__ import annotations

import time
from abc import ABC, abstractmethod
from contextvars import ContextVar
from functools import wraps
from typing import Any, ClassVar, cast

from uitask.vnc import VncClient


class Tool[ToolInputT](ABC):
    """
    Base class for all tools that can be used by agents to interact with computers.

    Generic Parameters:
        ToolInputT: Type of input the tool accepts
    """

    # Depth counter for nested Tool.run invocations - declared here for type checking
    _RUN_DEPTH: ClassVar[ContextVar[int]]

    @abstractmethod
    def name(self) -> str:
        """
        Returns the name of the tool, a unique identifier for this tool type
        """
        ...

    @abstractmethod
    def description(self) -> str:
        """
        Returns a natural language description of what the tool does, ideally describing its
        purpose, functionality and when to use it
        """
        ...

    @abstractmethod
    def run(self, client: VncClient, tool_input: ToolInputT) -> None: ...

    def __init_subclass__(cls, **kwargs: Any) -> None:
        """Wrap subclass run methods to ensure exactly one pre/post per call."""
        super().__init_subclass__(**kwargs)

        if "run" in cls.__dict__:
            original_run = cast(Any, cls.run)

            @wraps(original_run)
            def wrapped_run(self: Any, client: VncClient, tool_input: Any) -> None:
                depth = Tool._RUN_DEPTH.get()
                if depth > 0:
                    return original_run(self, client, tool_input)
                depth_context = Tool._RUN_DEPTH.set(depth + 1)
                try:
                    # Take a screenshot to force RFB updates
                    client.take_screenshot()
                    original_run(self, client, tool_input)
                    # Buffer actions by adding a slight delay
                    time.sleep(0.3)
                finally:
                    Tool._RUN_DEPTH.reset(depth_context)

            cls.run = cast(Any, wrapped_run)


# Depth counter for nested Tool.run invocations (e.g., super().run chains).
# Class-level ContextVar shared across all instances but with isolated values per execution context.
# Required for reentracy with support for frozen dataclasses.
# Defined outside class to avoid potential issues with dataclass subclasses.
Tool._RUN_DEPTH = ContextVar("_tool_run_depth", default=0)

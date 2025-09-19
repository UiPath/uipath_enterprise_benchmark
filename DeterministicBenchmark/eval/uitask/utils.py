import socket
import traceback
from pathlib import Path
from typing import Any


def to_jsonable(value: Any) -> Any:
    """Recursively convert values to JSON-serializable structures."""
    if value is None or isinstance(value, (bool, int, float, str)):
        return value
    # Enums
    if hasattr(value, "value") and isinstance(getattr(value, "value"), (str, int, float)):
        try:
            return value.value  # type: ignore[attr-defined]
        except Exception:
            pass
    # Dataclasses
    if hasattr(value, "__dataclass_fields__"):
        return {k: to_jsonable(getattr(value, k)) for k in value.__dataclass_fields__.keys()}  # type: ignore[attr-defined]
    # Mappings
    if isinstance(value, dict):
        return {str(to_jsonable(k)): to_jsonable(v) for k, v in value.items()}
    # Sequences/Sets
    if isinstance(value, (list, tuple, set)):
        return [to_jsonable(v) for v in value]
    # Paths
    if isinstance(value, Path):
        return str(value)
    # Fallback
    return str(value)


def is_port_available(port: int, host: str = "127.0.0.1") -> bool:
    """Check if a port is available for binding.

    Args:
        port: The port number to check
        host: The host address to bind to (default: localhost)

    Returns:
        True if the port is available, False otherwise
    """
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind((host, port))
        return True
    except OSError:
        return False


def exception_to_json(e: BaseException) -> dict[str, Any]:
    """Convert an exception into a JSON-serializable dictionary including traceback."""
    tb = "".join(traceback.format_exception(type(e), e, e.__traceback__))
    cause_info: dict[str, Any] | None = None
    if e.__cause__ is not None:
        cause = e.__cause__
        cause_info = {
            "type": type(cause).__name__,
            "message": str(cause),
        }
    context_info: dict[str, Any] | None = None
    if e.__context__ is not None and e.__context__ is not e.__cause__:
        ctx = e.__context__
        context_info = {
            "type": type(ctx).__name__,
            "message": str(ctx),
        }
    return {
        "type": type(e).__name__,
        "message": str(e),
        "args": list(e.args),
        "traceback": tb,
        "cause": cause_info,
        "context": context_info,
    }


def pick_free_port(exclude: set[int] | None = None, start_port: int | None = None) -> int:
    """Return a free localhost TCP port that is not in ``exclude``.

    Scans from start_port (or random starting point) upward and attempts to bind
    to each candidate port, returning the first one that is actually available.
    Uses randomization to reduce race conditions in concurrent scenarios.
    """
    import random

    if exclude is None:
        exclude = set()

    # Use random starting point to reduce race conditions
    if start_port is None:
        start_port = random.randint(10000, 20000)

    # Try from start_port upward
    for port in range(start_port, 65536):
        if port in exclude:
            continue
        if is_port_available(port):
            return port

    # If we didn't find anything from start_port to 65535, try from 10000 to start_port
    for port in range(10000, start_port):
        if port in exclude:
            continue
        if is_port_available(port):
            return port

    raise RuntimeError("No free TCP port available on localhost in range 10000-65535")

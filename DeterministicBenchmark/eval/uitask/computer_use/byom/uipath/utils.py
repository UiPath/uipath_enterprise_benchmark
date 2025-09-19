import asyncio
import json
import os
import threading
import time
import webbrowser
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator, Literal

import jwt
import portalocker

from uipath._cli._auth._auth_server import HTTPServer
from uipath._cli._auth._oidc_utils import get_auth_config, get_auth_url
from uipath._cli._utils._console import ConsoleLogger

console = ConsoleLogger()
_TOKEN_LOCK = threading.Lock()


def _get_driver_dir() -> Path:
    """Return the path to the `eval` directory.

    Falls back conservatively if the directory name cannot be located.
    """
    this_file = Path(__file__).resolve()
    for parent in this_file.parents:
        if parent.name == "eval":
            return parent
    # Fallback to a reasonable ancestor if structure changes
    return this_file.parents[3] if len(this_file.parents) >= 4 else this_file.parent


def _get_state_dir() -> Path:
    """Return the persistent UiPath state directory inside eval: `.uipath`."""
    state_dir = _get_driver_dir() / ".uipath"
    state_dir.mkdir(parents=True, exist_ok=True)
    return state_dir


@contextmanager
def _global_token_file_lock(timeout_seconds: int = 300) -> Iterator[None]:
    """Cross-process lock using an OS-level file lock.

    Ensures only one Python process generates a UiPath token at a time.
    """
    lock_dir_env = os.getenv("UIPATH_TOKEN_LOCK_DIR")
    if lock_dir_env and lock_dir_env.strip():
        lock_path = Path(lock_dir_env)
    else:
        # Default to the persistent `.uipath` directory inside `eval`
        lock_path = _get_state_dir()
    lock_file = lock_path / "uipath_token.lock"

    # Ensure directory exists
    lock_file.parent.mkdir(parents=True, exist_ok=True)

    start = time.time()
    with open(lock_file, "w") as f:
        while True:
            try:
                # Try to acquire an exclusive, non-blocking lock
                portalocker.lock(f, portalocker.LOCK_EX | portalocker.LOCK_NB)
                break
            except portalocker.LockException:
                if time.time() - start > timeout_seconds:
                    raise TimeoutError(
                        "Timed out waiting for global UiPath token lock. Another process may be stuck."
                    )
                time.sleep(0.2)

        try:
            yield
        finally:
            # Lock is automatically released when file is closed
            portalocker.unlock(f)


def _decode_jwt_exp(token: str) -> int | None:
    payload = jwt.decode(
        token,
        options={
            "verify_signature": False,
            "verify_exp": False,
        },
    )
    exp = payload.get("exp")
    return int(exp) if isinstance(exp, (int, float)) else None


def _token_not_expired(token: str) -> bool:
    exp_epoch = _decode_jwt_exp(token)
    if exp_epoch is None:
        return False
    # Consider token invalid if within skew window of expiry
    return time.time() < exp_epoch


def generate_uipath_token(domain: Literal["alpha", "staging", "cloud"]) -> str:
    # Serialize token generation across all threads and processes
    with _TOKEN_LOCK:
        with _global_token_file_lock():
            state_dir = _get_state_dir()
            token_file = state_dir / f"token_{domain}.json"
            # 1) Try to load a cached, non-expired token
            if token_file.exists():
                try:
                    cached = json.loads(token_file.read_text())
                    cached_token = cached.get("access_token")
                    if isinstance(cached_token, str) and _token_not_expired(cached_token):
                        return cached_token
                except Exception:
                    # Ignore cache read/parse errors and proceed to re-auth
                    pass

            # 2) No valid cached token; perform interactive authentication
            auth_url, code_verifier, state = get_auth_url(domain)
            webbrowser.open(auth_url, 1)
            auth_config = get_auth_config()
            console.link(
                "If a browser window did not open, please open the following URL in your browser:\n",
                auth_url,
            )

            server = HTTPServer(port=auth_config["port"])
            token_data = asyncio.run(server.start(state, code_verifier, domain))

            if not token_data:
                raise Exception("Authentication failed. Please try again")

            access_token = token_data["access_token"]

            # 3) Persist the new token for future runs
            try:
                payload: dict[str, object] = {"access_token": access_token}
                exp_epoch = _decode_jwt_exp(access_token)
                if exp_epoch is not None:
                    payload["exp"] = int(exp_epoch)

                with open(token_file, "w") as f:
                    f.write(json.dumps(payload))
            except Exception:
                # If persistence fails, still return the token
                pass

            return access_token

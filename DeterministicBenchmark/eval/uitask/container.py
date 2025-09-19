from __future__ import annotations

import json
import os
import select
import socket
import subprocess
import time
from enum import StrEnum
from pathlib import Path
from typing import Final
from urllib.error import URLError
from urllib.request import urlopen

import typer
from typing_extensions import Annotated

from uitask.utils import is_port_available, pick_free_port


class TaskType(StrEnum):
    COMBO_BOX = "combo-box-tasks"
    DATE_PICKER = "date-pickers"
    INPUT_BOX = "input-boxes"
    NAVIGATION_LIST_TABLES = "navigation-lists-tables"
    NAVIGATION_HIERACHICAL_SPATIAL = "navigation-hierarchical-spatial"
    NAVIGATION_SEARCH_INTERACTION = "navigation-search-interaction"
    TIME_PICKER = "time-pickers"
    KANBAN = "kanban-board"
    WORKDAY = "workday"
    SALESFORCE = "salesforce"
    SAP_STOCK = "sap-stock"
    CONCUR = "concur"
    COPY_PASTE = "copy-paste-tasks"
    BUSINESS_PROCESS = "business-process-tasks"


CONTAINER_NAME: Final[str] = "uitask-benchmark"
IMAGE_NAME: Final[str] = "xfce:latest"
DOCKERFILE: Final[str] = "docker/xfce.dockerfile"

app = typer.Typer()


def _docker_compose_up(
    *,
    project_root: Path,
    screen_width: int,
    screen_height: int,
    task_type: TaskType | None,
    task_id: int | None,
    vnc_port: int,
    cdp_port: int,
    container_name: str,
    build: bool,
) -> tuple[int, int, int]:  # Returns (exit_code, actual_vnc_port, actual_cdp_port)
    # Build image if requested or missing (mirrors compose build)
    def _image_exists(image: str) -> bool:
        return (
            subprocess.call(
                ["docker", "image", "inspect", image],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            == 0
        )

    if build or not _image_exists(IMAGE_NAME):
        dockerfile_path = project_root / DOCKERFILE
        build_cmd = [
            "docker",
            "build",
            "-f",
            dockerfile_path.as_posix(),  # Use forward slashes for Docker compatibility
            "-t",
            IMAGE_NAME,
            project_root.as_posix(),  # Use forward slashes for Docker compatibility
        ]
        print(f"Building Docker image: {' '.join(build_cmd)}")
        subprocess.check_call(build_cmd)

    # Remove any existing container with the same name (suppress errors if missing)
    subprocess.call(
        ["docker", "rm", "-f", container_name],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    # Always find unique ports for each container launch to avoid conflicts
    # This ensures multiple launches create separate containers even with same requested ports
    used_ports: set[int] = set()
    max_retries = 10

    # Start with requested ports but be prepared to change them
    actual_vnc_port = vnc_port
    actual_cdp_port = cdp_port

    for attempt in range(max_retries):
        # For subsequent attempts, always find new ports with randomization
        if attempt > 0:
            print(f"Attempt {attempt + 1}: Finding new ports to avoid conflicts...")
            # Use different random starting points to avoid race conditions
            import random

            vnc_start = random.randint(10000 + attempt * 1000, 15000 + attempt * 1000)
            cdp_start = random.randint(20000 + attempt * 1000, 25000 + attempt * 1000)

            actual_vnc_port = pick_free_port(used_ports, vnc_start)
            used_ports.add(actual_vnc_port)
            actual_cdp_port = pick_free_port(used_ports, cdp_start)
            used_ports.add(actual_cdp_port)
        else:
            # First attempt: check if requested ports are available
            if not is_port_available(actual_vnc_port):
                print(f"VNC port {actual_vnc_port} is in use, finding alternative...")
                actual_vnc_port = pick_free_port(used_ports)
                used_ports.add(actual_vnc_port)

            if not is_port_available(actual_cdp_port):
                print(f"CDP port {actual_cdp_port} is in use, finding alternative...")
                actual_cdp_port = pick_free_port(used_ports)
                used_ports.add(actual_cdp_port)

        # Run container detached (mirrors compose up for single service)
        run_cmd = [
            "docker",
            "run",
            "--detach",
            "--name",
            container_name,
            "--label",
            "uitask-benchmark=true",
            "-p",
            f"{actual_vnc_port}:5902",
            "-p",
            f"{actual_cdp_port}:9222",
            "-e",
            f"SCREEN_WIDTH={screen_width}",
            "-e",
            f"SCREEN_HEIGHT={screen_height}",
        ]
        if task_type is not None:
            run_cmd += ["-e", f"TASK_TYPE={task_type.value}"]
        if task_id is not None:
            run_cmd += ["-e", f"TASK_ID={task_id}"]

        run_cmd.append(IMAGE_NAME)

        # Run detached and capture container id (suppress printing to stdout)
        try:
            _container_id = subprocess.check_output(run_cmd, text=True).strip()
            print(
                f"Container started successfully with VNC port {actual_vnc_port}, CDP port {actual_cdp_port}"
            )
            return (0, actual_vnc_port, actual_cdp_port)
        except subprocess.CalledProcessError as exc:
            # If it's a port conflict, try again with new ports
            if "port is already allocated" in str(
                exc.stderr
            ) or "bind: address already in use" in str(exc.stderr):
                print(
                    f"Port conflict detected (attempt {attempt + 1}/{max_retries}), retrying with new ports..."
                )
                used_ports.update([actual_vnc_port, actual_cdp_port])
                actual_vnc_port = pick_free_port(used_ports)
                actual_cdp_port = pick_free_port(used_ports)
                continue
            else:
                # Other error, return immediately
                return (exc.returncode, actual_vnc_port, actual_cdp_port)

    # If we exhausted all retries
    print(f"Failed to start container after {max_retries} attempts due to port conflicts")
    return (1, actual_vnc_port, actual_cdp_port)


def _wait_for_port(host: str, port: int, timeout_seconds: int = 60) -> bool:
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(1.0)
            try:
                sock.connect((host, port))
                return True
            except OSError:
                time.sleep(0.5)
    return False


def _wait_for_vnc_rfb(host: str, port: int, timeout_seconds: int = 60) -> bool:
    """Verify VNC (RFB) server readiness robustly across implementations.

    Behavior differences to tolerate:
    - Some servers send the RFB greeting immediately upon TCP accept (server-first).
    - Others wait for a client banner first and then respond (rare, but seen with wrappers).
    - Greeting length is typically 12 bytes (e.g., b"RFB 003.008\n").

    Strategy:
    1) Connect and wait up to ~1s per attempt for the socket to become readable via select.
    2) If readable, peek at up to 12 bytes and check it startswith b"RFB ".
    3) If not readable, send a common client banner to prompt a response, then check again.
    Retry until the overall deadline expires.
    """
    deadline = time.time() + timeout_seconds
    client_probe = b"RFB 003.008\n"
    while time.time() < deadline:
        try:
            with socket.create_connection((host, port), timeout=1.0) as sock:
                sock.setblocking(False)
                # Wait briefly for server-first greeting
                rlist, _, _ = select.select([sock], [], [], 0.5)
                if rlist:
                    try:
                        greeting = sock.recv(12, socket.MSG_PEEK)
                    except BlockingIOError:
                        greeting = b""
                    if greeting.startswith(b"RFB "):
                        return True

                # Prompt servers that wait for a client banner
                try:
                    _ = sock.send(client_probe)
                except OSError:
                    pass

                # Wait again for response
                rlist, _, _ = select.select([sock], [], [], 0.5)
                if rlist:
                    try:
                        greeting = sock.recv(12, socket.MSG_PEEK)
                    except BlockingIOError:
                        greeting = b""
                    if greeting.startswith(b"RFB "):
                        return True
        except OSError:
            pass
        time.sleep(0.5)
    return False


def inspect_container(name: str) -> dict | None:
    try:
        output = subprocess.check_output(
            ["docker", "inspect", name],
            stderr=subprocess.STDOUT,
            text=True,
        )
    except subprocess.CalledProcessError:
        return None
    try:
        data = json.loads(output)
        return data[0] if data else None
    except json.JSONDecodeError:
        return None


def _wait_for_cdp_ready(*, cdp_port: int, timeout_seconds: int = 30) -> bool:
    """Poll http://localhost:{cdp_port}/json/version until it's reachable or timeout.

    Returns True if ready before timeout, else False.
    """
    deadline = time.time() + timeout_seconds
    url = f"http://localhost:{cdp_port}/json/version"
    while time.time() < deadline:
        try:
            with urlopen(url, timeout=1) as resp:
                code = resp.getcode()
                if code == 200:
                    # Read and discard body to ensure connection success
                    _ = resp.read(128)
                    return True
        except (URLError, TimeoutError, OSError):
            pass
        time.sleep(0.5)
    return False


@app.command()
def launch(
    screen_width: int = typer.Argument(..., help="VNC screen width, e.g., 1920"),
    screen_height: int = typer.Argument(..., help="VNC screen height, e.g., 1080"),
    task_type: Annotated[TaskType | None, typer.Option(help="Benchmark task type")] = None,
    task_id: Annotated[int | None, typer.Option(help="Benchmark task id")] = None,
    container_name: Annotated[str, typer.Option(help="Container name")] = CONTAINER_NAME,
    vnc_port: Annotated[
        int | None,
        typer.Option(help="Preferred VNC port (will find alternative if in use)"),
    ] = 5902,
    cdp_port: Annotated[
        int | None,
        typer.Option(help="Preferred CDP port (will find alternative if in use)"),
    ] = 9222,
    wait_timeout: Annotated[int, typer.Option(help="Seconds to wait for VNC readiness")] = 60,
    build: Annotated[bool, typer.Option(help="Build image even if it exists")] = False,
) -> tuple[int, int]:  # Returns (actual_vnc_port, actual_cdp_port)
    """Launch the deterministic benchmark container detached and wait for readiness.

    Returns the actual VNC and CDP ports used (may differ from requested if ports were in use).
    """
    # Identify DeterministicBenchmark as the project root
    project_root = Path(__file__).parent.parent.parent

    # If no ports specified, find free ones automatically with randomization
    if vnc_port is None:
        import random

        vnc_start = random.randint(10000, 15000)
        vnc_port = pick_free_port(start_port=vnc_start)
        print(f"No VNC port specified, automatically assigned: {vnc_port}")
    if cdp_port is None:
        import random

        cdp_start = random.randint(20000, 25000)  # Different range to avoid conflicts
        cdp_port = pick_free_port({vnc_port}, start_port=cdp_start)
        print(f"No CDP port specified, automatically assigned: {cdp_port}")

    code, actual_vnc_port, actual_cdp_port = _docker_compose_up(
        project_root=project_root,
        screen_width=screen_width,
        screen_height=screen_height,
        task_type=task_type,
        task_id=task_id,
        container_name=container_name,
        vnc_port=vnc_port,
        cdp_port=cdp_port,
        build=build,
    )
    if code != 0:
        raise typer.Exit(code)

    # First wait for TCP port then verify RFB handshake (use actual ports)
    ready = _wait_for_port("127.0.0.1", actual_vnc_port, timeout_seconds=wait_timeout)
    if not ready:
        typer.echo(
            f"Container started but VNC port not open on {actual_vnc_port} within {wait_timeout}s"
        )
        raise typer.Exit(1)

    rfb_ready = _wait_for_vnc_rfb("127.0.0.1", actual_vnc_port, timeout_seconds=wait_timeout)
    if not rfb_ready:
        typer.echo(
            f"Container started but VNC RFB handshake failed on port {actual_vnc_port} within {wait_timeout}s"
        )
        raise typer.Exit(1)

    typer.echo(
        f"VNC (RFB) ready on localhost:{actual_vnc_port}. Container '{container_name}' is running detached."
    )

    # Also ensure Chrome DevTools Protocol (CDP) endpoint is ready
    cdp_ready = _wait_for_cdp_ready(cdp_port=actual_cdp_port, timeout_seconds=wait_timeout)
    if not cdp_ready:
        typer.echo(
            f"Container started but CDP not ready on port {actual_cdp_port} within {wait_timeout}s"
        )
        raise typer.Exit(1)

    typer.echo(f"CDP ready on localhost:{actual_cdp_port}.")

    # Return the actual ports used
    return (actual_vnc_port, actual_cdp_port)


@app.command()
def status(
    container_name: Annotated[str, typer.Option(help="Container name")] = CONTAINER_NAME,
) -> None:
    """Show container status and port mappings."""
    info = inspect_container(container_name)
    if info is None:
        typer.echo(f"Container `{container_name}` not found.")
        raise typer.Exit(1)

    state = info.get("State", {})
    running = state.get("Running", False)
    status_text = state.get("Status", "unknown")
    ports = info.get("NetworkSettings", {}).get("Ports", {})

    def _fmt_port(pmap: list[dict] | None) -> str:
        if not pmap:
            return ""
        host = pmap[0].get("HostIp", "127.0.0.1")
        port = pmap[0].get("HostPort", "")
        return f"{host}:{port}"

    vnc = _fmt_port(ports.get("5902/tcp"))
    cdp = _fmt_port(ports.get("9222/tcp"))

    typer.echo(f"Name: {CONTAINER_NAME}")
    typer.echo(f"Running: {running} ({status_text})")
    typer.echo(f"VNC: {vnc if vnc else 'unmapped'} -> 5902")
    typer.echo(f"CDP: {cdp if cdp else 'unmapped'} -> 9222")


@app.command()
def delete(
    container_name: Annotated[str, typer.Option(help="Container name")] = CONTAINER_NAME,
    silent: Annotated[bool, typer.Option(help="Silent mode")] = False,
) -> None:
    """Force remove the container if it exists."""
    try:
        if silent:
            # Redirect stdout and stderr to devnull in silent mode
            with open(os.devnull, "w") as devnull:
                code = subprocess.call(
                    ["docker", "rm", "-f", container_name], stdout=devnull, stderr=devnull
                )
        else:
            code = subprocess.call(["docker", "rm", "-f", container_name])

        if not silent:
            if code == 0:
                typer.echo(f"Removed container '{container_name}'.")
            else:
                typer.echo(f"Container '{container_name}' not found or could not be removed.")
    except Exception:
        if not silent:
            typer.echo(f"Error occurred while trying to remove container '{container_name}'.")


@app.command()
def cleanup(
    silent: Annotated[bool, typer.Option(help="Silent mode")] = False,
) -> None:
    """Remove all containers with the uitask-benchmark label."""
    try:
        # First, get all container IDs with the uitask-benchmark label
        list_cmd = ["docker", "ps", "-aq", "--filter", "label=uitask-benchmark=true"]

        if silent:
            with open(os.devnull, "w") as devnull:
                container_ids = subprocess.check_output(list_cmd, stderr=devnull, text=True).strip()
        else:
            container_ids = subprocess.check_output(list_cmd, text=True).strip()

        if not container_ids:
            if not silent:
                typer.echo("No uitask-benchmark containers found.")
            return

        # Split container IDs and remove them
        container_list = container_ids.split("\n")
        if not silent:
            typer.echo(f"Found {len(container_list)} uitask-benchmark containers to remove.")

        # Remove all containers at once
        remove_cmd = ["docker", "rm", "-f"] + container_list

        if silent:
            with open(os.devnull, "w") as devnull:
                code = subprocess.call(remove_cmd, stdout=devnull, stderr=devnull)
        else:
            code = subprocess.call(remove_cmd)

        if not silent:
            if code == 0:
                typer.echo(
                    f"Successfully removed {len(container_list)} uitask-benchmark containers."
                )
            else:
                typer.echo("Some containers could not be removed.")

    except subprocess.CalledProcessError:
        if not silent:
            typer.echo("Error occurred while listing containers.")
    except Exception as e:
        if not silent:
            typer.echo(f"Error occurred during cleanup: {e}")


@app.command()
def build(
    image_name: Annotated[str, typer.Option(help="Docker image name to build")] = IMAGE_NAME,
    dockerfile: Annotated[
        str, typer.Option(help="Path to Dockerfile relative to DeterministicBenchmark")
    ] = DOCKERFILE,
) -> None:
    """Build Docker image from Dockerfile in DeterministicBenchmark directory."""
    # Identify DeterministicBenchmark as the project root
    project_root = Path(__file__).parent.parent.parent
    dockerfile_path = project_root / dockerfile

    # Verify dockerfile exists
    if not dockerfile_path.exists():
        typer.echo(f"Error: Dockerfile not found at {dockerfile_path}")
        raise typer.Exit(1)

    # Build the docker command
    build_cmd = [
        "docker",
        "build",
        "-t",
        image_name,
        "-f",
        dockerfile_path.as_posix(),  # Use forward slashes for Docker compatibility
        project_root.as_posix(),  # Use forward slashes for Docker compatibility
    ]

    typer.echo(f"Building Docker image '{image_name}' from {dockerfile}")
    typer.echo(f"Command: {' '.join(build_cmd)}")

    try:
        # Run the build command
        subprocess.run(build_cmd, check=True)
        typer.echo(f"Successfully built Docker image '{image_name}'")
    except subprocess.CalledProcessError as e:
        typer.echo(f"Error: Docker build failed with exit code {e.returncode}")
        raise typer.Exit(e.returncode)
    except FileNotFoundError:
        typer.echo(
            "Error: Docker command not found. Please ensure Docker is installed and in PATH."
        )
        raise typer.Exit(1)


if __name__ == "__main__":
    app()

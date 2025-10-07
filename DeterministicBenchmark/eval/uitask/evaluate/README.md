### Base Evaluation Harness

This module orchestrates running UI benchmark tasks in parallel against the deterministic desktop container. It wires up:

- Container lifecycle (start per‑task desktop, ensure VNC/CDP are ready, cleanup)
- Agent construction per task (via a small `AgentBuilder` Protocol)
- Parallel execution with retries using Dask
- Idempotent outputs under an organized directory layout

Use this when you want to plug in your own agent/client and evaluate it across benchmark tasks and screen resolutions.

### What `run.py` provides

- **`AgentBuilder` Protocol**: A callable that receives `(task, output_dir, vnc_port, cdp_port)` and returns an `Agent` (from `uitask.computer_use`). This decouples orchestration from your implementation.
- **`Task`**: A dataclass built from the benchmark JSON (`id`, `ques`) plus runtime parameters. Includes `Task.create_from_json(...)` and a stable `container_name` per task/resolution/job.
- **`run_task(...)`**: Launches the deterministic container, builds the agent via your `AgentBuilder`, runs it (`agent.run(max_steps)`), and always cleans up the container.
  - Skips already‑completed tasks by checking for `execution.json` (from `uitask.computer_use.EXECUTION_FILE`).
  - Skips if a same‑name container is already running.
- **`run_tasks(...)`**: Loads tasks, expands across resolutions, and executes them in parallel using a local Dask cluster.
  - Options: build image, filter by task ids, retries, `num_workers`, `threads_per_worker`, `max_steps`, `record`, `rerun`.
  - Prints a Dask dashboard link and handles Ctrl‑C with cleanup.

Container management relies on `uitask.environment.container` and automatically maps unique free ports for VNC and CDP per task.

Port handling:

- You do NOT allocate or manage ports in your client code. The harness launches the container and supplies `vnc_port` and `cdp_port` to your `agent_builder`.
- Your agent must accept these two numbers and pass them to the base `Agent` (via constructor/super call) so it connects to the correct container instance hosting the environment.

### Reference: UiPath example (`byom/uipath`)

The `byom/uipath/screenplay.py` entrypoint demonstrates a full integration that:

- Parses CLI options (model name, outputs, resolutions, parallelism, etc.)
- Defines an `agent_builder` that constructs a `UiPathScreenplay` for each task with the provided VNC/CDP ports
- Calls `run_tasks(...)` to fan out execution

Use it as a template when bringing your own model/provider.

### Typical data and outputs

- **Tasks file**: JSON list with `id` like `"salesforce--3"` and `ques` (the instruction/prompt).
  - This repo already provides an example at `DeterministicBenchmark/deterministic_bench.json`.
  - From `DeterministicBenchmark/eval`, reference it as `../deterministic_bench.json`.
- **Outputs** (per task/resolution under `output_dir/<model>/<WIDTH_HEIGHT>/<task_id>`):
  - `execution.json` (final trace)
  - `partial_execution.json` (updated during run)
  - `error.txt` (if an exception occurs)
  - Recording artifacts: client/server byte+time streams under `recording/`
  - Post-processing artifacts (run separately): `action_screenshots.json`, `action_screenshots.html`, and images under `action_screenshots/`

### How to write your own evaluation entrypoint

Implement a small CLI that builds your agent with the ports provided by the container and delegates orchestration to `run_tasks(...)`. Use the minimal `MyAgent` example from `uitask/computer_use/README.md` (or your own subclass) and wire it up here.

```python
# pseudocode: evaluate/byom/my_client/evaluate.py
import typer
from pathlib import Path

from uitask.computer_use import Agent  # or subclass from act.Agent
from uitask.evaluate.run import ScreenResolution, Task, run_tasks

app = typer.Typer()

from uitask.computer_use import Agent  # import your Agent subclass; see README there

@app.command()
def evaluate(
    model: str = typer.Option(..., help="Model or run id"),
    task_file: Path = typer.Option(..., help="Path to benchmark tasks JSON"),
    output_dir: Path = typer.Option(..., help="Folder to write results"),
    resolution: list[str] = typer.Option(["1920_1080"], help="WIDTH_HEIGHT list"),
    num_workers: int = 1,
    threads_per_worker: int = 5,
    rerun: bool = False,
    max_steps: int = 50,
    retries: int = 1,
    build_image: bool = True,
    task_filter: list[str] = typer.Option([], help="Subset of task ids to run"),
):
    # Organize outputs under a model namespace
    model_out = (output_dir / model)
    model_out.mkdir(parents=True, exist_ok=True)

    # Parse resolutions
    resolutions = [
        ScreenResolution(width=int(w), height=int(h))
        for w, h in map(lambda s: s.split("_"), resolution)
    ]

    # Define how to build your agent for each task
    def agent_builder(task: Task, output_dir: Path, vnc_port: int, cdp_port: int) -> Agent:
        return MyAgent(
            task=task.task,
            output_dir=output_dir,
            vnc_port=vnc_port,
            cdp_port=cdp_port,
            model=model,
        )

    run_tasks(
        agent_builder=agent_builder,
        tasks_file=task_file,
        output_dir=model_out,
        resolutions=resolutions,
        rerun=rerun,
        max_steps=max_steps,
        num_workers=num_workers,
        threads_per_worker=threads_per_worker,
        retries=retries,
        job_id=model,
        build_image=build_image,
        task_filters=set(task_filter) if task_filter else None,
    )

if __name__ == "__main__":
    app()
```

Notes:

- Your `MyAgent` can be a thin wrapper around any client as long as it conforms to the harness’s action API. See `uitask/computer_use/README.md` for available actions and outputs.
- Always return after a single atomic action in `act()`; the harness calls it in a loop until you return `True` or hit `max_steps`.
- Port allocation is handled by the harness. Accept the provided `vnc_port` and `cdp_port` and forward them to the base `Agent`; do not hard‑code ports.

### Running the UiPath reference

From `DeterministicBenchmark/eval`:

```bash
uv run python -m uitask.evaluate.byom.uipath.screenplay evaluate \
  --model my-model \
  --task-file ../deterministic_bench.json \
  --output-dir ./results \
  --resolution 1920_1080 \
  --num-workers 1 \
  --threads-per-worker 5 \
  --max-steps 50 \
  --build-image true
```

Why `./results/my-model`? The UiPath entrypoint organizes outputs under `output_dir / model`. In the example we pass `--model my-model`, so results are written to `./results/my-model`. Choose your own model name to namespace runs. If you prefer writing directly to `./results`, implement a custom entrypoint (see pseudocode above) that does not append the model when setting `output_dir`.

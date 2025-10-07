from pathlib import Path

import typer

from uitask.computer_use import UiPathScreenplay
from uitask.evaluate.run import ScreenResolution, Task, run_tasks

app = typer.Typer()


@app.command()
def evaluate(
    model: str = typer.Option(..., help="Model name"),
    output_dir: Path = typer.Option(..., help="Output directory"),
    task_file: Path = typer.Option(..., help="Task file"),
    num_workers: int = typer.Option(default=1, help="Number of workers to run"),
    threads_per_worker: int = typer.Option(default=5, help="Number of threads per worker"),
    resolution: list[str] = typer.Option(
        default=["1920_1080"], help="Resolutions to run in format WIDTH_HEIGHT"
    ),
    rerun: bool = typer.Option(
        default=False, help="Rerun the task even if it has been already executed"
    ),
    max_steps: int = typer.Option(default=50, help="Max steps to run per agent"),
    max_prev_steps: int = typer.Option(
        default=3,
        help="The number of previous steps to keep in state",
    ),
    retries: int = typer.Option(default=1, help="Number of retries to run the task"),
    verbose: bool = typer.Option(default=False, help="Verbose output"),
    build_image: bool = typer.Option(
        default=True,
        help="Build the docker image prior to execution",
    ),
    task_filter: list[str] = typer.Option(
        default=[],
        help="Filter the tasks to run",
    ),
    reenact: bool = typer.Option(False, help="Run reenactment instead of acting live"),
    step_wait_time: float = typer.Option(5.0, help="Seconds to wait between reenact steps"),
) -> None:
    output_dir = output_dir / model
    output_dir.mkdir(parents=True, exist_ok=True)
    resolutions = [
        ScreenResolution(width=int(width), height=int(height))
        for width, height in map(lambda x: x.split("_"), resolution)
    ]

    def agent_builder(task: Task, output_dir: Path, vnc_port: int, cdp_port: int):
        return UiPathScreenplay(
            task=task.task,
            title=f"UI Benchmark Env Test: {task.task_key}",
            model_name=model,
            output_dir=output_dir,
            vnc_port=vnc_port,
            cdp_port=cdp_port,
            verbose=verbose,
            max_prev_steps=max_prev_steps,
        )

    run_tasks(
        agent_builder=agent_builder,
        tasks_file=task_file,
        output_dir=output_dir,
        resolutions=resolutions,
        rerun=rerun,
        max_steps=max_steps,
        num_workers=num_workers,
        threads_per_worker=threads_per_worker,
        retries=retries,
        job_id=model,
        build_image=build_image,
        task_filters=set(task_filter) if task_filter else None,
        reenact=reenact,
        step_wait_time=step_wait_time,
    )


if __name__ == "__main__":
    app()

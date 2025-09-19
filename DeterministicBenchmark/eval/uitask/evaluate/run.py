from __future__ import annotations

import json
import time
import traceback
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol, runtime_checkable

from dask.distributed import Client, LocalCluster

from uitask.computer_use import EXECUTION_FILE, Agent
from uitask.container import TaskType, build, delete, inspect_container, launch


@runtime_checkable
class AgentBuilder(Protocol):
    def __call__(self, task: Task, output_dir: Path, vnc_port: int, cdp_port: int) -> Agent: ...


@dataclass
class ScreenResolution:
    width: int
    height: int


@dataclass
class Task:
    task_key: str
    task: str
    screen_width: int
    screen_height: int
    task_type: TaskType
    task_id: int
    max_steps: int
    record: bool
    unique_id: str | None = None

    @property
    def container_name(self) -> str:
        container_name = f"uitask-{self.screen_width}_{self.screen_height}-{self.task_key}"
        if self.unique_id is not None:
            container_name += f"-{self.unique_id}"

        return container_name

    @classmethod
    def create_from_json(
        cls,
        data: dict[str, str],
        screen_width: int,
        screen_height: int,
        max_steps: int,
        record: bool,
        unique_id: str | None = None,
    ) -> Task:
        assert "id" in data, "Missing required field `id`"
        assert "ques" in data, "Missing required field `ques`"
        task_key = data["id"]
        task_type, task_id = task_key.split("--")
        try:
            task_type = TaskType(task_type)
            task_id = int(task_id)
        except Exception:
            raise ValueError(f"Invalid task id: {task_key}")

        return cls(
            task_key=task_key,
            screen_width=screen_width,
            screen_height=screen_height,
            task_type=task_type,
            task_id=task_id,
            task=data["ques"],
            max_steps=max_steps,
            record=record,
            unique_id=unique_id,
        )


def run_task(
    task: Task,
    agent_builder: AgentBuilder,
    output_dir: Path,
    rerun: bool = False,
) -> None:
    task_output_dir = output_dir / f"{task.screen_width}_{task.screen_height}" / task.task_key
    task_output_dir.mkdir(parents=True, exist_ok=True)

    # Skip completed task
    if (task_output_dir / EXECUTION_FILE).exists() and not rerun:
        print(f"Skipping task {task.task_key}")
        return

    # Skip any containers that are currently running
    if _check_container_running(task.container_name):
        print(f"Skipping task {task.task_key} because container is running")
        return

    try:
        vnc_port, cdp_port = launch(
            screen_width=task.screen_width,
            screen_height=task.screen_height,
            task_type=task.task_type,
            task_id=task.task_id,
            container_name=task.container_name,
            build=False,
            vnc_port=None,
            cdp_port=None,
        )

        print("Sleeping for 3s to wait for container to be ready")
        time.sleep(3)

        agent = agent_builder(
            task=task,
            output_dir=task_output_dir,
            vnc_port=vnc_port,
            cdp_port=cdp_port,
        )

        agent.run(max_steps=task.max_steps, record=task.record)
    except Exception:
        print(traceback.format_exc())
    finally:
        delete(container_name=task.container_name)


def run_tasks(
    agent_builder: AgentBuilder,
    tasks_file: Path,
    output_dir: Path,
    resolutions: list[ScreenResolution],
    record: bool,
    max_steps: int,
    num_workers: int,
    threads_per_worker: int,
    rerun: bool = False,
    retries: int = 1,
    task_filters: set[str] | None = None,
    job_id: str | None = None,
    build_image: bool = False,
) -> None:
    if build_image:
        build()

    assert tasks_file.exists(), f"Tasks file not found: {tasks_file}"
    assert num_workers > 0, "Number of workers must be greater than 0"
    assert threads_per_worker > 0, "Number of threads per worker must be greater than 0"

    with open(tasks_file) as f:
        benchmark_tasks = []
        for task in json.load(f):
            if task_filters is None or task["id"] in task_filters:
                for resolution in resolutions:
                    benchmark_tasks.append(
                        Task.create_from_json(
                            task,
                            resolution.width,
                            resolution.height,
                            max_steps,
                            record,
                            job_id,
                        )
                    )

    if len(benchmark_tasks) == 0:
        print("No tasks to run")
        return

    num_workers = min(num_workers, len(benchmark_tasks) // threads_per_worker + 1)
    cluster = LocalCluster(n_workers=num_workers, threads_per_worker=threads_per_worker)
    client = Client(cluster)

    tasks = client.map(
        lambda task: run_task(
            task=task,
            agent_builder=agent_builder,
            output_dir=output_dir,
            rerun=rerun,
        ),
        benchmark_tasks,
        retries=retries,
    )

    print(f"Review tasks: {client.dashboard_link}")
    try:
        # Wait for all tasks to complete
        client.gather(tasks)
        print("All tasks completed successfully")
    except (KeyboardInterrupt, Exception):
        print("Interrupted by user, cancelling tasks...")
        if tasks:
            client.cancel(tasks, force=True)
            # Wait a moment for cancellation to propagate
            time.sleep(2)
            for task in benchmark_tasks:
                delete(container_name=task.container_name, silent=True)
    finally:
        # Ensure all tasks are properly cleaned up before shutdown
        try:
            # Wait for any remaining task cleanup
            print("Cleaning up remaining tasks...")
            time.sleep(2)

            # Gracefully close client and cluster
            print("Shutting down Dask cluster...")
            client.close()
            cluster.close()
            print("Cluster shutdown complete")

        except Exception:
            client.shutdown()
            if tasks:
                for task in benchmark_tasks:
                    delete(container_name=task.container_name, silent=True)


def _check_container_running(container_name: str) -> bool:
    try:
        info = inspect_container(container_name)
        if info is not None:
            state = info.get("State", {})
            if state.get("Running", False):
                return True
    except Exception:
        return False

    return False

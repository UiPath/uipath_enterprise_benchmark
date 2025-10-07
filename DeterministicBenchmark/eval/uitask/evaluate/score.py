import json
from collections import OrderedDict
from pathlib import Path

import typer

complex_tasks = {
    "kanban-board",
    "workday",
    "sap-stock",
    "concur",
    "business-process-tasks",
    "salesforce",
    "copy-paste-tasks",
}


def score(result_dir: Path, max_steps: int) -> None:
    per_model_results = {}
    for model_dir in result_dir.iterdir():
        if model_dir.is_dir():
            model = model_dir.name
            per_model_results[model] = {}
            for resolution_dir in model_dir.iterdir():
                if resolution_dir.is_dir():
                    resolution = resolution_dir.name
                    per_model_results[model][resolution] = {}
                    for task_dir in resolution_dir.iterdir():
                        if task_dir.is_dir():
                            task = task_dir.name
                            task_type, task_id = task.split("--")
                            with open(task_dir / "execution.json") as f:
                                execution = json.load(f)
                                success = False
                                proper_stop = False
                                complete = True
                                success_ind = next(
                                    (
                                        i
                                        for i in range(len(execution))
                                        if execution[i]["task_marked_complete"]
                                    ),
                                    None,
                                )
                                if success_ind is not None:
                                    success = True
                                    if (
                                        success_ind == len(execution) - 1
                                        or execution[success_ind + 1]["action"] == "finish"
                                    ):
                                        proper_stop = True

                                if not success and len(execution) < max_steps:
                                    complete = False

                                task_res = {
                                    "success": success,
                                    "proper_stop": proper_stop,
                                    "complete": complete,
                                    "steps_performed": len(execution),
                                    "success_index": success_ind,
                                    "finish_index": next(
                                        (
                                            i
                                            for i in range(len(execution))
                                            if execution[i]["action"] == "finish"
                                        ),
                                        None,
                                    ),
                                }

                                if task_type not in per_model_results[model][resolution]:
                                    per_model_results[model][resolution][task_type] = {"tasks": {}}

                                per_model_results[model][resolution][task_type]["tasks"][
                                    task_id
                                ] = task_res

    # Process and restructure data with proper ordering
    ordered_results = OrderedDict()

    for model in per_model_results:
        ordered_results[model] = OrderedDict()

        # Initialize all_resolution aggregation
        all_resolution_data = {}

        # First pass: process individual resolutions and collect data for all_resolution
        resolution_data = {}
        for resolution in per_model_results[model]:
            resolution_ordered = OrderedDict()

            complex_tasks_total = 0
            complex_tasks_succeeded = 0
            simple_tasks_total = 0
            simple_tasks_succeeded = 0

            # Process task types for this resolution
            task_type_data = {}
            for task_type in per_model_results[model][resolution]:
                tasks = per_model_results[model][resolution][task_type]["tasks"]
                # Convert to list of (task_id, task_data) tuples, sort by task_id, then back to dict
                sorted_tasks = dict(sorted(tasks.items(), key=lambda x: int(x[0])))

                num_succeeded = 0
                num_completed = 0
                num_proper_stop = 0
                for task in sorted_tasks.values():
                    if task["success"]:
                        num_succeeded += 1
                    if task["complete"]:
                        num_completed += 1
                    if task["proper_stop"]:
                        num_proper_stop += 1

                task_type_stats = {
                    "num_tasks": len(sorted_tasks),
                    "num_succeeded": num_succeeded,
                    "success_rate": round(num_succeeded / len(tasks), 4),
                    "num_proper_stop": num_proper_stop,
                    "num_completed": num_completed,
                    "tasks": sorted_tasks,
                }

                task_type_data[task_type] = task_type_stats

                # Aggregate for all_resolution
                if task_type not in all_resolution_data:
                    all_resolution_data[task_type] = {
                        "num_tasks": len(tasks),
                        "num_succeeded": num_succeeded,
                        "num_proper_stop": num_proper_stop,
                        "num_completed": num_completed,
                    }
                else:
                    all_resolution_data[task_type]["num_tasks"] += len(tasks)
                    all_resolution_data[task_type]["num_succeeded"] += num_succeeded
                    all_resolution_data[task_type]["num_proper_stop"] += num_proper_stop
                    all_resolution_data[task_type]["num_completed"] += num_completed

                # Track complex vs simple for this resolution
                if task_type in complex_tasks:
                    complex_tasks_total += len(tasks)
                    complex_tasks_succeeded += num_succeeded
                else:
                    simple_tasks_total += len(tasks)
                    simple_tasks_succeeded += num_succeeded

            # Add complex/simple summaries first
            resolution_ordered["complex_tasks_total"] = complex_tasks_total
            resolution_ordered["complex_tasks_succeeded"] = complex_tasks_succeeded
            resolution_ordered["complex_tasks_success_rate"] = (
                round(complex_tasks_succeeded / complex_tasks_total, 4)
                if complex_tasks_total > 0
                else 0
            )
            resolution_ordered["simple_tasks_total"] = simple_tasks_total
            resolution_ordered["simple_tasks_succeeded"] = simple_tasks_succeeded
            resolution_ordered["simple_tasks_success_rate"] = (
                round(simple_tasks_succeeded / simple_tasks_total, 4)
                if simple_tasks_total > 0
                else 0
            )

            # Then add individual task types
            for task_type in sorted(task_type_data.keys()):
                resolution_ordered[task_type] = task_type_data[task_type]

            resolution_data[resolution] = resolution_ordered

            # Aggregate complex/simple for all_resolution
            if "complex_tasks_total" in all_resolution_data:
                all_resolution_data["complex_tasks_total"] += complex_tasks_total
                all_resolution_data["complex_tasks_succeeded"] += complex_tasks_succeeded
                all_resolution_data["simple_tasks_total"] += simple_tasks_total
                all_resolution_data["simple_tasks_succeeded"] += simple_tasks_succeeded
            else:
                all_resolution_data["complex_tasks_total"] = complex_tasks_total
                all_resolution_data["complex_tasks_succeeded"] = complex_tasks_succeeded
                all_resolution_data["simple_tasks_total"] = simple_tasks_total
                all_resolution_data["simple_tasks_succeeded"] = simple_tasks_succeeded

        # Finalize all_resolution data
        all_resolution_ordered = OrderedDict()
        all_resolution_ordered["complex_tasks_total"] = all_resolution_data["complex_tasks_total"]
        all_resolution_ordered["complex_tasks_succeeded"] = all_resolution_data[
            "complex_tasks_succeeded"
        ]
        all_resolution_ordered["complex_tasks_success_rate"] = (
            round(
                all_resolution_data["complex_tasks_succeeded"]
                / all_resolution_data["complex_tasks_total"],
                2,
            )
            if all_resolution_data["complex_tasks_total"] > 0
            else 0
        )
        all_resolution_ordered["simple_tasks_total"] = all_resolution_data["simple_tasks_total"]
        all_resolution_ordered["simple_tasks_succeeded"] = all_resolution_data[
            "simple_tasks_succeeded"
        ]
        all_resolution_ordered["simple_tasks_success_rate"] = (
            round(
                all_resolution_data["simple_tasks_succeeded"]
                / all_resolution_data["simple_tasks_total"],
                2,
            )
            if all_resolution_data["simple_tasks_total"] > 0
            else 0
        )

        # Add task type summaries to all_resolution (without individual tasks)
        for task_type in sorted(all_resolution_data.keys()):
            if task_type not in [
                "complex_tasks_total",
                "complex_tasks_succeeded",
                "simple_tasks_total",
                "simple_tasks_succeeded",
            ]:
                task_data = all_resolution_data[task_type]
                all_resolution_ordered[task_type] = {
                    "num_tasks": task_data["num_tasks"],
                    "num_succeeded": task_data["num_succeeded"],
                    "success_rate": round(task_data["num_succeeded"] / task_data["num_tasks"], 4),
                    "num_proper_stop": task_data["num_proper_stop"],
                    "num_completed": task_data["num_completed"],
                }

        # Build final ordered structure: all_resolution first, then other resolutions
        ordered_results[model]["all_resolution"] = all_resolution_ordered
        for resolution in sorted(resolution_data.keys()):
            ordered_results[model][resolution] = resolution_data[resolution]

    per_model_results = ordered_results

    output_path = result_dir / "per_model_results.json"
    with open(output_path, "w") as f:
        json.dump(per_model_results, f)


app = typer.Typer(help="Score UITask results directory")


@app.command()
def main(result_dir: Path, max_steps: int) -> None:
    """Compute summary scores for a results directory.

    result_dir: Directory containing per-model results tree
    max_steps: Maximum allowed steps per task
    """
    score(result_dir, max_steps)


if __name__ == "__main__":
    app()

from pathlib import Path
from typing import Iterator

import typer
from dask.distributed import Client, as_completed
from tqdm import tqdm

from uitask.vnc import postprocess_output_dir

app = typer.Typer(help="Utility CLI for UITask post-processing")


def _has_recording(dir_path: Path) -> bool:
    rec = dir_path / "recording"
    return (
        rec.is_dir()
        and (rec / "client.rfb.bin").exists()
        and (rec / "client.time.bin").exists()
        and (rec / "server.rfb.bin").exists()
        and (rec / "server.time.bin").exists()
    )


def _has_outputs(dir_path: Path) -> bool:
    json_path = dir_path / "action_screenshots.json"
    html_path = dir_path / "action_screenshots.html"
    json_reenact = dir_path / "reenact_action_screenshots.json"
    html_reenact = dir_path / "reenact_action_screenshots.html"
    img_dir = dir_path / "action_screenshots"
    have_normal = json_path.exists() and html_path.exists()
    have_reenact = json_reenact.exists() and html_reenact.exists()
    have_imgs = img_dir.is_dir() and any(img_dir.iterdir())
    return (have_normal or have_reenact) and have_imgs


def _find_runs(root: Path) -> Iterator[Path]:
    for exec_file in root.rglob("execution.json"):
        run_dir = exec_file.parent
        if _has_recording(run_dir):
            yield run_dir


@app.command()
def main(
    root_dir: Path,
    overwrite: bool = typer.Option(False, help="Overwrite existing results"),
    num_workers: int = typer.Option(1, help="Number of Dask workers"),
    threads_per_worker: int = typer.Option(2, help="Threads per Dask worker"),
) -> None:
    """Scan ROOT_DIR for runs (execution.json + recording/) and process each.

    Use --overwrite to regenerate even if results already exist.
    """
    runs = list(_find_runs(root_dir))
    if not runs:
        typer.echo("No runs found.")
        return

    todo = [r for r in runs if overwrite or not _has_outputs(r)]
    if not todo:
        typer.echo("Nothing to do (all runs already processed).")
        return

    client = Client(n_workers=num_workers, threads_per_worker=threads_per_worker, processes=True)
    try:
        futures = [client.submit(postprocess_output_dir, r) for r in todo]
        pbar = tqdm(total=len(futures), desc="Post-processing runs")
        for _ in as_completed(futures):
            pbar.update(1)
        pbar.close()
    except Exception as e:
        typer.echo(f"Processing failed: {e}")
    finally:
        client.close()


if __name__ == "__main__":
    app()

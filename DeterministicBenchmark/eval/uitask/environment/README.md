### Deterministic UI Task Evaluation Environment

This directory provides a small CLI for launching and managing a deterministic desktop environment inside Docker for UI task benchmarking. The CLI is implemented in `uitask.environment.container` and exposed as the `uitask-container` command.

The container runs an XFCE desktop with:

- **VNC** server (for screen control and recording)
- **Chrome DevTools Protocol (CDP)** endpoint (for DOM inspection used by agents)

On launch, the CLI verifies that both VNC and CDP are reachable before returning.

### Prerequisites

- Docker installed and running
- Python 3.12 (this project pins Python 3.12 in `eval/pyproject.toml`)
- Recommended: run commands via `uv` from the `DeterministicBenchmark/eval` directory

### Docker image and defaults

- **Image name**: `xfce:latest`
- **Container name**: `uitask-benchmark`
- **Dockerfile**: `DeterministicBenchmark/docker/xfce.dockerfile`
- Containers launched by this tool are labeled with `uitask-benchmark=true` to enable bulk cleanup.

### CLI usage

All commands are available via the installed console script `uitask-container`. If you are working inside this repo, you can run them with `uv` without installing globally:

```bash
cd DeterministicBenchmark/eval
uv run uitask-container --help
```

Key commands:

- **Build image**

  ```bash
  uv run uitask-container build
  # Options:
  #   --image-name xfce:latest
  #   --dockerfile docker/xfce.dockerfile
  ```

- **Launch container (detached) and wait for readiness**

  ```bash
  # Basic: width height
  uv run uitask-container launch 1920 1080

  # With task selection and explicit ports
  uv run uitask-container launch 1920 1080 \
    --task-type salesforce \
    --task-id 3 \
    --vnc-port 5902 \
    --cdp-port 9222
  ```

  Notes:

  - If a requested port is in use, the CLI automatically picks a free alternative and prints the actual VNC/CDP ports.
  - On success it prints that VNC (RFB) and CDP are ready and returns the actual ports.

- **Show status**

  ```bash
  uv run uitask-container status
  # Shows running state and host port mappings for 5902 (VNC) and 9222 (CDP)
  ```

- **Delete a single container by name**

  ```bash
  uv run uitask-container delete --container-name uitask-benchmark
  ```

- **Cleanup all benchmark containers (by label)**

  ```bash
  uv run uitask-container cleanup
  ```

### Ports and connectivity

- Host VNC is mapped to container `5902/tcp`.
- Host CDP is mapped to container `9222/tcp`.

You can connect your VNC client to `localhost:<vnc_port>` and access CDP (e.g., for Playwright or raw inspection) at `http://localhost:<cdp_port>` (the CLI waits for `GET /json/version` to return 200).

### Task selection

You can select a benchmark task type and an optional task id at launch. The accepted `--task-type` values correspond to the following:

- `combo-box-tasks`
- `date-pickers`
- `input-boxes`
- `navigation-lists-tables`
- `navigation-hierarchical-spatial`
- `navigation-search-interaction`
- `time-pickers`
- `kanban-board`
- `workday`
- `salesforce`
- `sap-stock`
- `concur`
- `copy-paste-tasks`
- `business-process-tasks`

These values are passed into the container via environment variables and used by the desktop session to open the corresponding deterministic task UI.

### Environment variables set in the container

The launcher sets the following environment variables on the container:

- `SCREEN_WIDTH`: e.g., `1920`
- `SCREEN_HEIGHT`: e.g., `1080`
- `TASK_TYPE`: one of the values listed above (if provided)
- `TASK_ID`: integer id for the selected task (if provided)

### Troubleshooting

- If you see a message about ports being in use, the CLI will retry with free ports automatically and print the chosen ones.
- If CDP readiness fails, verify that the container is running and that port `9222` is mapped on the host (use the `status` command).
- To recover from a stuck run, use `delete` (single container) or `cleanup` (all labeled containers) and launch again.

### Where this is implemented

- CLI entrypoint: `uitask.environment.container:app` (exposed as `uitask-container`)
- Project scripts are defined in `DeterministicBenchmark/eval/pyproject.toml` under `[project.scripts]`.

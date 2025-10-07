from __future__ import annotations

import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import uvicorn
from fastapi import APIRouter, FastAPI, WebSocket

from ..ws import VncRecorder


@dataclass(frozen=True)
class VncService:
    vnc_host: str
    vnc_port: int
    output_dir: Path

    def router(self) -> APIRouter:
        router = APIRouter()
        router.websocket("/")(self.vnc_record)
        return router

    async def vnc_record(self, frontend: WebSocket) -> None:
        recording_path = self.output_dir / "recording"
        recording_path.mkdir(exist_ok=True, parents=True)
        await VncRecorder.from_connection(self.vnc_host, self.vnc_port).vnc_ws(
            frontend=frontend,
            recording_path=recording_path,
        )

        return


@dataclass(frozen=True)
class VncServer:
    address: str
    server: uvicorn.Server
    thread: threading.Thread

    def start(self) -> None:
        self.thread.start()

    def stop(self) -> None:
        self.server.should_exit = True
        self.thread.join()

    @classmethod
    def create(
        cls,
        host: str,
        port: int,
        vnc_host: str,
        vnc_port: int,
        output_dir: Path,
    ) -> VncServer:
        app = FastAPI(debug=True)
        service = VncService(vnc_host=vnc_host, vnc_port=vnc_port, output_dir=output_dir)
        app.include_router(router=service.router())
        config = uvicorn.Config(
            app,
            host=host,
            port=port,
            log_level="critical",
            access_log=False,
            ws_max_size=2_147_483_647,  # effectively unlimited (~2 GiB)
            ws_max_queue=2_147_483_647,  # very large queue to avoid backpressure drops
        )
        server = uvicorn.Server(config)
        thread = threading.Thread(target=server.run)
        return cls(f"{host}:{port}", server, thread)

    def __enter__(self) -> VncServer:
        self.start()
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        self.stop()

from __future__ import annotations

import os
import time
from collections import deque
from dataclasses import dataclass, field
from enum import StrEnum
from pathlib import Path
from pprint import pprint
from typing import Any, Literal, cast

import dotenv
import requests
from pydantic import BaseModel, ConfigDict, Field, field_serializer
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from uitask.models.display import Position
from uitask.models.pointer import MouseButton, MouseClickType, ScrollDirection
from uitask.tools import (
    MouseClickAction,
    MouseDragAction,
    ScrollAction,
)

from ...act import Agent
from .utils import generate_uipath_token


class ScreenplayMethodType(StrEnum):
    CLICK = "click"
    TYPE_INTO = "type_into"
    WAIT = "wait_load_completed"
    FINISH = "finish"
    SCROLL = "scroll"
    DRAG = "drag"
    KEY_PRESS = "keypress"
    MOUSE_MOVE = "mouse_move"
    USER_QUESTION = "user_question"


class ScreenplayAction(BaseModel):
    description: str
    method_type: ScreenplayMethodType
    parameters: dict[str, Any] = Field(default_factory=dict)
    id: str | None = None
    result: str | None = None

    @field_serializer("method_type")
    def _serialize_method_type(self, value: ScreenplayMethodType) -> str:
        return value.value


class ScreenplayStep(BaseModel):
    description: str
    thought: str | None = None
    actions: list[ScreenplayAction] = Field(default_factory=list)
    additional_parameters: dict[str, Any] | None = None


class ScreenplayPreviousStep(ScreenplayStep):
    image: str
    url: str | None = None

    @classmethod
    def from_step(
        cls,
        step: ScreenplayStep,
        image: str,
        url: str | None = None,
    ) -> ScreenplayPreviousStep:
        for action in step.actions:
            # Handle user-question to simply responding "yes" to avoid infinite questions
            if action.method_type == ScreenplayMethodType.USER_QUESTION:
                action.result = "yes"

        return cls(
            description=step.description,
            thought=step.thought,
            actions=step.actions,
            additional_parameters=step.additional_parameters,
            image=image,
            url=url,
        )


class ScreenplayMetadata(BaseModel):
    uipath_computer_use: bool = True
    include_additional_trace_info: bool = False


class ScreenplayState(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    title: str
    user_task: str = Field(validation_alias="userTask", serialization_alias="userTask")
    image: str
    image_width: int
    image_height: int
    raw_dom: list[str] = Field(
        validation_alias="rawDOM",
        serialization_alias="rawDOM",
    )
    url: str | None = None
    model_name: str
    env_name: str
    metadata: ScreenplayMetadata
    previous_steps: deque[ScreenplayPreviousStep] = Field(
        validation_alias="previousSteps",
        serialization_alias="previousSteps",
    )
    input_variables: dict[str, Any]
    output_variables: dict[str, Any]

    def model_dump(self, *args: Any, **kwargs: Any) -> dict[str, Any]:
        kwargs.setdefault("by_alias", True)
        return super().model_dump(*args, **kwargs)

    def model_dump_json(self, *args: Any, **kwargs: Any) -> str:
        kwargs.setdefault("by_alias", True)
        return super().model_dump_json(*args, **kwargs)

    @field_serializer("previous_steps")
    def _serialize_previous_steps(
        self, value: deque[ScreenplayPreviousStep]
    ) -> list[ScreenplayPreviousStep]:
        # Serialize deque as list for JSON compatibility
        return list(value)

    @classmethod
    def create(
        cls,
        *,
        title: str,
        task: str,
        model_name: str,
        starting_b64_img: str,
        screen_width: int,
        screen_height: int,
        env_name: str,
        raw_dom: list | None = None,
        url: str | None = None,
        metadata: ScreenplayMetadata | None = None,
        max_prev_steps: int = 3,
        input_variables: dict[str, Any] | None = None,
        output_variables: dict[str, Any] | None = None,
    ) -> ScreenplayState:
        if metadata is None:
            metadata = ScreenplayMetadata()
        if input_variables is None:
            input_variables = {}
        if output_variables is None:
            output_variables = {}
        if raw_dom is None:
            raw_dom = []

        return cls(
            model_name=model_name,
            user_task=task,
            title=title,
            image=starting_b64_img,
            image_width=screen_width,
            image_height=screen_height,
            raw_dom=raw_dom,
            url=url,
            metadata=metadata,
            env_name=env_name,
            previous_steps=deque(maxlen=max_prev_steps),
            input_variables=input_variables,
            output_variables=output_variables,
        )


@dataclass(kw_only=True)
class UiPathScreenplay(Agent):
    task: str
    model_name: str
    output_dir: Path
    title: str = "UI Task Benchmark Test"
    env_name: str = "linux"
    vnc_scheme: str = "ws"
    vnc_host: str = "localhost"
    vnc_port: int = 5902
    cdp_port: int = 9222
    verbose: bool = False
    max_prev_steps: int = 3
    _request_timeout: float = 290.0
    _req_retries: int = 5
    _connect_timeout: float = 10.0

    _env: Literal["alpha", "staging", "cloud"] = field(init=False, repr=False)
    _server: str = field(init=False, repr=False)
    _headers: dict[str, str] = field(init=False, repr=False)
    _state: ScreenplayState = field(init=False, repr=False)
    _session: requests.Session = field(init=False, repr=False)

    def __post_init__(self) -> None:
        dotenv.load_dotenv(dotenv_path=Path(__file__).parent / ".env", override=True)
        _env = os.environ["UIPATH_ENV"].lower()
        assert _env in ["alpha", "staging", "cloud"], (
            "UIPATH_ENV must be one of alpha, staging, or cloud"
        )
        # Cast to Literal type after assertion for type checker
        self._env = cast(Literal["alpha", "staging", "cloud"], _env)
        org_id = os.environ["UIPATH_ORG_ID"]
        tenant_id = os.environ["UIPATH_TENANT_ID"]
        super().__post_init__()

        token = generate_uipath_token(self._env)

        print("Authenticated with UiPath successfully!")
        self._server = f"https://{self._env}.uipath.com/{org_id}/{tenant_id}/autopilotstudio_/v2/agent-act-on-screen"
        self._headers = {
            "Authorization": f"Bearer {token}",
            "X-UiPath-Tenantid": tenant_id,
            "Content-Type": "application/json",
        }

        # Configure a persistent HTTP session with retries and connection pooling
        self._session = requests.Session()
        retry_cfg = Retry(
            total=5,
            connect=5,
            read=5,
            status=5,
            allowed_methods=frozenset({"POST"}),
            backoff_factor=0.5,
            status_forcelist=(429, 500, 502, 503, 504, 524),
            raise_on_status=False,
        )
        adapter = HTTPAdapter(pool_connections=100, pool_maxsize=100, max_retries=retry_cfg)
        self._session.mount("https://", adapter)
        self._session.mount("http://", adapter)
        self._session.headers.update({"Connection": "keep-alive"})

        init_screen = self.screenshot()
        screen_width, screen_height = self.client_resolution()
        self._screen_width = screen_width
        self._screen_height = screen_height
        self._state = ScreenplayState.create(
            title=self.title,
            task=self.task,
            model_name=self.model_name,
            starting_b64_img=init_screen,
            screen_width=screen_width,
            screen_height=screen_height,
            max_prev_steps=self.max_prev_steps,
            env_name=self.env_name,
        )

    def act(self) -> bool:
        finished = False
        step = self._post_with_retries(self._state.model_dump())
        for action in step.actions:
            if self.verbose:
                print(
                    f"\nAction {len(self.action_history)}: \n\t-vnc port: {self.vnc_port}\n\t-title: {self.title}\n\t-resolution: {self._screen_width}x{self._screen_height}"
                )
                pprint(action.model_dump())

            finished = self._perform_action(action)
            if finished:
                break

        self._state.previous_steps.append(
            ScreenplayPreviousStep.from_step(step, image=self._state.image),
        )

        self._state.image = self.screenshot()
        return finished

    def _post_with_retries(self, body: dict[str, Any]) -> ScreenplayStep:
        last_exc: Exception | None = None
        for attempt in range(self._req_retries + 1):
            try:
                # Attempt the POST, allow long read timeout
                res = requests.post(
                    self._server,
                    headers=self._headers,
                    json=body,
                    timeout=self._request_timeout,
                )

                # Handle 401 once by refreshing token and retrying immediately
                if res.status_code == 401:
                    # Re-authenticate once
                    token = generate_uipath_token(self._env)
                    self._headers["Authorization"] = f"Bearer {token}"
                    # Re-send immediately (does not consume a non-401 retry)
                    res = requests.post(
                        self._server,
                        headers=self._headers,
                        json=body,
                        timeout=self._request_timeout,
                    )

                # Raise for non-2xx
                res.raise_for_status()

                # Parse JSON; retry if not JSON
                try:
                    content = res.json()
                except Exception as e:
                    last_exc = e
                    if attempt < self._req_retries:
                        time.sleep(5 * (attempt + 1))
                        continue
                    raise

                # Retry if API indicates error
                if isinstance(content, dict) and "error" in content:
                    last_exc = Exception(str(content.get("error")))
                    if attempt < self._req_retries:
                        time.sleep(10 * (attempt + 1))
                        continue

                    raise last_exc

                # Validate step; retry on validation failure
                try:
                    step = ScreenplayStep.model_validate(content["step"])
                except Exception as e:
                    last_exc = e
                    if attempt < self._req_retries:
                        time.sleep(10 * (attempt + 1))
                        continue

                    raise

                return step

            except requests.exceptions.RequestException as e:
                # Includes timeouts, connection errors (e.g., BrokenPipeError)
                last_exc = e
                if attempt < self._req_retries:
                    time.sleep(10 * (attempt + 1))
                    continue
                raise

        # Should not reach here; re-raise last exception if present
        if last_exc is not None:
            raise last_exc

        raise RuntimeError("POST failed without exception and without response JSON")

    def _perform_action(self, action: ScreenplayAction) -> bool:
        finished = False
        match action.method_type:
            case ScreenplayMethodType.KEY_PRESS:
                self.press_keys(action.parameters["keys"])
            case ScreenplayMethodType.TYPE_INTO:
                self.type_text(action.parameters["value"])
            case ScreenplayMethodType.CLICK:
                position = self._get_parameter_position(action.parameters)
                click_type = MouseClickType(action.parameters.get("click_type", "single"))
                self.mouse_click(
                    MouseClickAction(
                        button=MouseButton(action.parameters.get("button", "left")),
                        position=position,
                        click_type=click_type,
                    )
                )
            case ScreenplayMethodType.WAIT:
                self.wait(duration=int(action.parameters.get("duration", 3)))
            case ScreenplayMethodType.FINISH:
                self.finish(params=action.parameters)
                finished = True
            case ScreenplayMethodType.MOUSE_MOVE:
                self.mouse_move(self._get_parameter_position(action.parameters))
            case ScreenplayMethodType.SCROLL:
                position = self._get_parameter_position(action.parameters)
                direction = ScrollDirection(action.parameters["direction"])
                self.mouse_scroll(ScrollAction(position=position, direction=direction))
            case ScreenplayMethodType.DRAG:
                start_xy, end_xy = action.parameters["path"]
                start = Position(start_xy["x"], start_xy["y"])
                end = Position(end_xy["x"], end_xy["y"])
                self.mouse_drag(MouseDragAction(button=MouseButton("left"), start=start, end=end))
            case ScreenplayMethodType.USER_QUESTION:
                pass

        return finished

    @staticmethod
    def _get_parameter_position(parameters: dict[str, Any]) -> Position:
        x, y = parameters["position"]
        return Position(x, y)

from pydantic import BaseModel
from datetime import datetime
from typing import Any


class StackCreate(BaseModel):
    id:          str
    name:        str
    description: str = ""
    workflow:    dict[str, Any] = {}


class StackUpdate(BaseModel):
    name:        str | None = None
    description: str | None = None
    workflow:    dict[str, Any] | None = None


class StackOut(BaseModel):
    id:          str
    name:        str
    description: str
    workflow:    dict[str, Any]
    created_at:  datetime
    updated_at:  datetime

    model_config = {"from_attributes": True}

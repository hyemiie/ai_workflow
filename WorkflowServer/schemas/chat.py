from pydantic import BaseModel
from datetime import datetime


class ChatMessageOut(BaseModel):
    id:         str
    stack_id:   str
    role:       str
    content:    str
    created_at: datetime

    model_config = {"from_attributes": True}


class RunQueryRequest(BaseModel):
    stack_id: str
    query:    str
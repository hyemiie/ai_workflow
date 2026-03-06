from pydantic import BaseModel
from datetime import datetime


class DocumentOut(BaseModel):
    id:          str
    stack_id:    str
    node_id:     str
    filename:    str
    chunk_count: int
    uploaded_at: datetime

    model_config = {"from_attributes": True}
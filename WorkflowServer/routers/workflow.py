import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from core.db import get_db
from models.stack import Stack
from models.chat import ChatMessage
from schemas.chat import RunQueryRequest, ChatMessageOut
from services.workflow_runner import run_workflow

router = APIRouter(prefix="/workflow", tags=["Workflow"])


@router.post("/run", response_model=ChatMessageOut)
async def run(payload: RunQueryRequest, db: AsyncSession = Depends(get_db)):
    stack = await db.get(Stack, payload.stack_id)
    if not stack:
        raise HTTPException(404, "Stack not found")

    user_msg = ChatMessage(id=str(uuid.uuid4()), stack_id=payload.stack_id, role="user", content=payload.query)
    db.add(user_msg)

    answer = await run_workflow(stack.workflow, payload.query)

    ai_msg = ChatMessage(id=str(uuid.uuid4()), stack_id=payload.stack_id, role="assistant", content=answer)
    db.add(ai_msg)
    await db.commit()
    await db.refresh(ai_msg)
    return ai_msg
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from core.db import get_db
from models.chat import ChatMessage
from schemas.chat import ChatMessageOut

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.get("/{stack_id}", response_model=list[ChatMessageOut])
async def get_history(stack_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.stack_id == stack_id)
        .order_by(ChatMessage.created_at)
    )
    return result.scalars().all()


@router.delete("/{stack_id}", status_code=204)
async def clear_history(stack_id: str, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(ChatMessage).where(ChatMessage.stack_id == stack_id))
    await db.commit()







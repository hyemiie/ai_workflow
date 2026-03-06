from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from core.db import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id:         Mapped[str]      = mapped_column(String, primary_key=True)
    stack_id:   Mapped[str]      = mapped_column(String, ForeignKey("stacks.id", ondelete="CASCADE"))
    role:       Mapped[str]      = mapped_column(String(10))  
    content:    Mapped[str]      = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
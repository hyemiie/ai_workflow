from sqlalchemy import String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from core.db import Base


class Document(Base):
    __tablename__ = "documents"

    id:           Mapped[str]      = mapped_column(String, primary_key=True)
    stack_id:     Mapped[str]      = mapped_column(String, ForeignKey("stacks.id", ondelete="CASCADE"))
    node_id:      Mapped[str]      = mapped_column(String)         
    filename:     Mapped[str]      = mapped_column(String(255))
    content:      Mapped[str]      = mapped_column(Text)           
    chunk_count:  Mapped[int]      = mapped_column(Integer, default=0)
    collection:   Mapped[str]      = mapped_column(String(255))     
    uploaded_at:  Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

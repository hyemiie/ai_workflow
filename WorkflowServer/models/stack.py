from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime, timezone
from core.db import Base


class Stack(Base):
    __tablename__ = "stacks"

    id:          Mapped[str]      = mapped_column(String, primary_key=True)
    name:        Mapped[str]      = mapped_column(String(255), nullable=False)
    description: Mapped[str]      = mapped_column(Text, default="")
    workflow:    Mapped[dict]     = mapped_column(JSONB, default=dict)
    owner_id:    Mapped[str]      = mapped_column(String, ForeignKey("users.id"), nullable=False)
    created_at:  Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at:  Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="stacks")
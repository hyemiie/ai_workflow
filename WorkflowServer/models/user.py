from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from core.db import Base


class User(Base):
    __tablename__ = "users"

    id:              Mapped[str]      = mapped_column(String, primary_key=True)
    email:           Mapped[str]      = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str]      = mapped_column(String, nullable=False)
    created_at:      Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    stacks = relationship("Stack", back_populates="owner", cascade="all, delete-orphan")
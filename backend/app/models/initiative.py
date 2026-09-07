from datetime import datetime
from enum import StrEnum

from sqlalchemy import DateTime, Enum, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class InitiativeStatus(StrEnum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class Initiative(Base):
    __tablename__ = "initiatives"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(120), index=True)
    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(40), index=True)
    location: Mapped[str] = mapped_column(String(120))
    organizer: Mapped[str] = mapped_column(String(80))
    status: Mapped[InitiativeStatus] = mapped_column(
        Enum(
            InitiativeStatus,
            name="initiative_status",
            values_callable=lambda enum_type: [item.value for item in enum_type],
        ),
        default=InitiativeStatus.OPEN,
    )
    volunteer_goal: Mapped[int] = mapped_column(Integer, default=1)
    volunteer_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class VolunteerSignup(Base):
    __tablename__ = "volunteer_signups"

    id: Mapped[int] = mapped_column(primary_key=True)
    initiative_id: Mapped[int] = mapped_column(index=True)
    volunteer_name: Mapped[str] = mapped_column(String(80))
    volunteer_email: Mapped[str] = mapped_column(String(255), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
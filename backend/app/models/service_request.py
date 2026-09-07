from datetime import datetime
from enum import StrEnum

from sqlalchemy import DateTime, Enum, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ServiceRequestStatus(StrEnum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"


class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    issue_category: Mapped[str] = mapped_column(String(40), index=True)
    location: Mapped[str] = mapped_column(String(120), index=True)
    urgency: Mapped[str] = mapped_column(String(20))
    description: Mapped[str] = mapped_column(Text)
    requester_contact: Mapped[str] = mapped_column(String(255))
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[ServiceRequestStatus] = mapped_column(
        Enum(
            ServiceRequestStatus,
            name="service_request_status",
            values_callable=lambda enum_type: [item.value for item in enum_type],
        ),
        default=ServiceRequestStatus.PENDING,
    )
    assigned_to: Mapped[str | None] = mapped_column(String(120), nullable=True)
    assigned_contact: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
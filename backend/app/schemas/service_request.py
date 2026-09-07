from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.service_request import ServiceRequestStatus


class ServiceRequestCreate(BaseModel):
    issue_category: str = Field(min_length=2, max_length=40)
    location: str = Field(min_length=2, max_length=120)
    urgency: str = Field(pattern="^(low|medium|high|critical)$")
    description: str = Field(min_length=10, max_length=2000)
    requester_contact: str = Field(min_length=5, max_length=255)
    image_url: str | None = Field(default=None, max_length=500)


class ServiceRequestAssignment(BaseModel):
    assigned_to: str = Field(min_length=2, max_length=120)
    assigned_contact: str = Field(min_length=5, max_length=255)


class ServiceRequestStatusUpdate(BaseModel):
    status: ServiceRequestStatus


class ServiceRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    issue_category: str
    location: str
    urgency: str
    description: str
    requester_contact: str
    image_url: str | None
    status: ServiceRequestStatus
    assigned_to: str | None
    assigned_contact: str | None
    created_at: datetime
    updated_at: datetime
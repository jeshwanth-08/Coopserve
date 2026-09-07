from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.initiative import InitiativeStatus


class InitiativeCreate(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(min_length=10, max_length=2000)
    category: str = Field(min_length=2, max_length=40)
    location: str = Field(min_length=2, max_length=120)
    organizer: str = Field(min_length=2, max_length=80)
    volunteer_goal: int = Field(default=5, ge=1, le=10000)


class VolunteerSignupCreate(BaseModel):
    volunteer_name: str = Field(min_length=2, max_length=80)
    volunteer_email: str = Field(min_length=5, max_length=255)


class InitiativeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    category: str
    location: str
    organizer: str
    status: InitiativeStatus
    volunteer_goal: int
    volunteer_count: int
    created_at: datetime


class DashboardStats(BaseModel):
    active_initiatives: int
    community_members: int
    volunteer_hours: int
    neighborhoods: int
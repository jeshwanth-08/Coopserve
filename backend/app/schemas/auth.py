from typing import Literal

from pydantic import BaseModel, EmailStr, Field

UserRole = Literal["admin", "service_provider", "member"]


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class AuthUser(BaseModel):
    email: EmailStr
    name: str
    role: UserRole
    capabilities: list[str]


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUser
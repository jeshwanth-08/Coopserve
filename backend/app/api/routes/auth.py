from fastapi import APIRouter, HTTPException, status

from app.schemas.auth import AuthUser, LoginRequest, LoginResponse
from app.services.auth import create_access_token, find_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest) -> LoginResponse:
    user = find_user(payload.email, payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return LoginResponse(
        access_token=create_access_token(user),
        user=AuthUser(
            email=user.email,
            name=user.name,
            role=user.role,
            capabilities=user.capabilities,
        ),
    )
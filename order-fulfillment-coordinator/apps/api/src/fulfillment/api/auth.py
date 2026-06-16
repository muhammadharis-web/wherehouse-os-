from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, status
from jose import jwt
from pydantic import BaseModel

from fulfillment.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

DEMO_USERS: dict[str, dict[str, str]] = {
    "admin@fulfillment.com": {
        "password": "admin123",
        "name": "Admin User",
        "role": "admin",
    },
    "operator@fulfillment.com": {
        "password": "operator123",
        "name": "Operator User",
        "role": "operator",
    },
    "viewer@fulfillment.com": {
        "password": "viewer123",
        "name": "Viewer User",
        "role": "viewer",
    },
}


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str = "User"


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


@router.post("/register", response_model=LoginResponse)
async def register(body: RegisterRequest) -> LoginResponse:
    if body.email in DEMO_USERS:
        raise HTTPException(status_code=400, detail="Email already registered")
    DEMO_USERS[body.email] = {
        "password": body.password,
        "name": body.name,
        "role": "user",
    }
    return await login(LoginRequest(email=body.email, password=body.password))


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest) -> LoginResponse:
    user = DEMO_USERS.get(body.email)
    if user is None or user["password"] != body.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_id = body.email.replace("@", "_").replace(".", "_")
    now = datetime.now(timezone.utc)
    token = jwt.encode(
        {
            "sub": user_id,
            "email": body.email,
            "name": user["name"],
            "role": user["role"],
            "iat": now,
            "exp": now + timedelta(minutes=settings.jwt_expiration_minutes),
        },
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )

    return LoginResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=body.email,
            name=user["name"],
            role=user["role"],
        ),
    )

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum

class RoleEnum(str, Enum):
    user = "user"
    admin = "admin"

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: RoleEnum = RoleEnum.user

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    role: RoleEnum

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
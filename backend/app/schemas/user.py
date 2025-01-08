from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr

class UserLogin(UserBase):
    password: str

class UserCreate(UserLogin):
    pass

class UserResponse(UserBase):
    id: int
    is_admin: bool
    is_active: bool = True
    created_at: datetime
    message: Optional[str] = None

    class Config:
        from_attributes = True 
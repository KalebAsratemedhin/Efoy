from pydantic import BaseModel, EmailStr, Field, field_serializer
from typing import Optional, Literal
from datetime import datetime

class UserBase(BaseModel):
    fullName: str
    email: EmailStr
    role: Literal['patient', 'doctor', 'admin'] = 'patient'
    phoneNumber: Optional[str] = None
    sex: Optional[Literal['male', 'female', 'other']] = None
    address: Optional[str] = None
    age: Optional[int] = Field(default=None, ge=0)
    profilePic: Optional[str] = None
    googleId: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    fullName: Optional[str] = None
    phoneNumber: Optional[str] = None
    sex: Optional[Literal['male', 'female', 'other']] = None
    address: Optional[str] = None
    age: Optional[int] = Field(default=None, ge=0)
    profilePic: Optional[str] = None

class UserOut(UserBase):
    id: str
    isVerified: bool = False
    isRestricted: bool = False
    restrictedAt: Optional[datetime] = None
    restrictionReason: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_serializer('id')
    def serialize_id(self, value):
        return str(value) if value is not None else None

    model_config = {
        "from_attributes": True,
    }


class RestrictUserRequest(BaseModel):
    reason: Optional[str] = Field(None, max_length=500) 
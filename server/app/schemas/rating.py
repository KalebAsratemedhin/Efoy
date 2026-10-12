from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from app.schemas.common import PaginatedResponse

class RatingCreate(BaseModel):
    doctorId: str
    value: float = Field(..., ge=0, le=5)

    @field_validator('value')
    @classmethod
    def value_range(cls, v):
        if not (0 <= v <= 5):
            raise ValueError('Value must be between 0 and 5')
        return v

class RatingUpdate(BaseModel):
    value: Optional[float]

    @field_validator('value')
    @classmethod
    def value_range(cls, v):
        if v is not None and not (0 <= v <= 5):
            raise ValueError('Value must be between 0 and 5')
        return v

class RatingOut(BaseModel):
    id: str
    raterId: str
    doctorId: str
    value: float
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    model_config = {"from_attributes": True}


class RatingPaginatedResponse(PaginatedResponse[RatingOut]):
    pass
 
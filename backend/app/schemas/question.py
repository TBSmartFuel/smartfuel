from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..models.models import QuestionType, QuestionCategory

class QuestionBase(BaseModel):
    text: str
    category: QuestionCategory
    question_type: QuestionType
    options: Optional[List[str]] = None
    validation: Optional[Dict[str, Any]] = None
    field_key: str
    order: int
    is_active: bool = True

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(QuestionBase):
    text: Optional[str] = None
    category: Optional[QuestionCategory] = None
    question_type: Optional[QuestionType] = None
    field_key: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None

class QuestionResponse(QuestionBase):
    id: int

    class Config:
        orm_mode = True

class UserResponseSchema(BaseModel):
    question_id: int
    answer: Any

    class Config:
        orm_mode = True

class UserResponseInDB(UserResponseSchema):
    id: int
    user_id: int
    response_value: Any
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class SaveResponseRequest(BaseModel):
    responses: List[UserResponseSchema]

    class Config:
        orm_mode = True 
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime

class UserInfo(BaseModel):
    age: int
    weight: float
    height: float
    activity_level: str
    fitness_goals: List[str]

class QuestionResponse(BaseModel):
    question_id: int
    answer: Any

class MealPlanCreate(BaseModel):
    plan_data: Dict
    start_date: datetime
    end_date: Optional[datetime] = None

class MealPlanRequest(BaseModel):
    user_info: UserInfo
    responses: List[QuestionResponse]

class MealPlanResponse(BaseModel):
    id: int
    user_id: int
    plan_data: Dict
    created_at: datetime
    updated_at: datetime
    is_active: bool
    start_date: datetime
    end_date: Optional[datetime]

    class Config:
        from_attributes = True 
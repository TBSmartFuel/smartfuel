from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserStats(BaseModel):
    total_users: int
    active_users: int
    admin_users: int

class QuestionStats(BaseModel):
    total_questions: int
    active_questions: int

class MealPlanStats(BaseModel):
    total_meal_plans: int
    active_meal_plans: int

class SystemHealth(BaseModel):
    database_connected: bool
    api_version: str
    last_backup: Optional[datetime]

class AdminStats(BaseModel):
    user_stats: UserStats
    question_stats: QuestionStats
    meal_plan_stats: MealPlanStats
    system_health: SystemHealth 
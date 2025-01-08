from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, JSON, DateTime, Float, Enum
from sqlalchemy.orm import relationship, backref
from datetime import datetime
from ..database import Base
import enum

class QuestionType(enum.Enum):
    TEXT = "text"
    NUMBER = "number"
    BOOLEAN = "boolean"
    MULTIPLE_CHOICE = "multiple_choice"
    SLIDER = "slider"
    RADIO = "radio"
    CHECKBOX = "checkbox"

class QuestionCategory(enum.Enum):
    PERSONAL_INFO = "personal_info"
    GOALS = "goals"
    FOOD_INTAKE = "food_intake"
    WORKOUT_ROUTINE = "workout_routine"
    STRESS_LEVELS = "stress_levels"
    TOXICITY_LIFESTYLE = "toxicity_lifestyle"
    WAIVER = "waiver"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    responses = relationship("UserResponse", back_populates="user")
    meal_plans = relationship("MealPlan", back_populates="user")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    category = Column(Enum(QuestionCategory), nullable=False)
    question_type = Column(Enum(QuestionType), nullable=False)
    options = Column(JSON, nullable=True)  # For multiple choice, checkbox questions
    validation = Column(JSON, nullable=True)  # For min, max, required, etc.
    order = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    parent_id = Column(Integer, ForeignKey('questions.id'), nullable=True)  # For nested questions
    field_key = Column(String, nullable=False)  # Maps to form field key

    # Relationships
    responses = relationship("UserResponse", back_populates="question")
    sub_questions = relationship("Question", 
                               backref=backref("parent", remote_side=[id]),
                               cascade="all, delete-orphan")

class UserResponse(Base):
    __tablename__ = "user_responses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    response_value = Column(JSON, nullable=False)  # Store any type of response as JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="responses")
    question = relationship("Question", back_populates="responses")

class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="meal_plans")

class SystemPrompt(Base):
    __tablename__ = "system_prompts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    prompt_text = Column(String, nullable=False)
    output_format = Column(String, nullable=True)  # For prompts that require specific output format
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    created_by = relationship("User", backref="created_prompts") 
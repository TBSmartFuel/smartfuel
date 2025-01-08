from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.models import SystemPrompt
from ..schemas.system_prompt import SystemPromptCreate, SystemPromptUpdate

def get_system_prompt(db: Session, prompt_id: int) -> Optional[SystemPrompt]:
    return db.query(SystemPrompt).filter(SystemPrompt.id == prompt_id).first()

def get_system_prompt_by_name(db: Session, name: str) -> Optional[SystemPrompt]:
    return db.query(SystemPrompt).filter(SystemPrompt.name == name).first()

def get_active_system_prompt_by_name(db: Session, name: str) -> Optional[SystemPrompt]:
    return db.query(SystemPrompt).filter(
        SystemPrompt.name == name,
        SystemPrompt.is_active == True
    ).first()

def get_system_prompts(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False
) -> List[SystemPrompt]:
    query = db.query(SystemPrompt)
    if active_only:
        query = query.filter(SystemPrompt.is_active == True)
    return query.offset(skip).limit(limit).all()

def create_system_prompt(
    db: Session,
    prompt: SystemPromptCreate,
    created_by_id: int
) -> SystemPrompt:
    db_prompt = SystemPrompt(
        **prompt.model_dump(),
        created_by_id=created_by_id
    )
    db.add(db_prompt)
    db.commit()
    db.refresh(db_prompt)
    return db_prompt

def update_system_prompt(
    db: Session,
    prompt_id: int,
    prompt: SystemPromptUpdate
) -> Optional[SystemPrompt]:
    db_prompt = get_system_prompt(db, prompt_id)
    if not db_prompt:
        return None
    
    update_data = prompt.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_prompt, field, value)
    
    db.commit()
    db.refresh(db_prompt)
    return db_prompt

def delete_system_prompt(db: Session, prompt_id: int) -> bool:
    db_prompt = get_system_prompt(db, prompt_id)
    if not db_prompt:
        return False
    
    db.delete(db_prompt)
    db.commit()
    return True

def toggle_system_prompt_active(db: Session, prompt_id: int) -> Optional[SystemPrompt]:
    db_prompt = get_system_prompt(db, prompt_id)
    if not db_prompt:
        return None
    
    db_prompt.is_active = not db_prompt.is_active
    db.commit()
    db.refresh(db_prompt)
    return db_prompt 

def create_or_update_meal_plan_prompt(db: Session, created_by_id: int) -> SystemPrompt:
    """Create or update the meal plan system prompt"""
    # Check if prompt already exists
    prompt = db.query(SystemPrompt).filter(
        SystemPrompt.name == "meal_plan"
    ).first()
    
    meal_plan_prompt = """You are a professional nutritionist and meal planner. Your task is to create a personalized weekly meal plan based on the user's information, preferences, and goals.

Please analyze the following user information carefully:
- Personal Information: age, height, weight, sex, body composition
- Health Goals: primary goals, preferred diet type, feeling and challenge goals
- Current Diet: typical meals, eating patterns
- Food Preferences: liked and disliked foods
- Exercise Routine: type and frequency of workouts
- Sleep & Recovery: sleep patterns and quality
- Stress Levels: current stress and management techniques

Based on this information, create a comprehensive weekly meal plan that:
1. Matches their fitness and health goals
2. Considers their food preferences and restrictions
3. Aligns with their activity level and schedule
4. Provides appropriate portions and calorie counts
5. Includes at least 5 personalized recommendations for their lifestyle

Make sure each meal is practical, achievable, and aligned with their daily routine. Consider their stress levels and sleep patterns when suggesting meal timing and portions."""
    
    if prompt:
        # Update existing prompt
        prompt.prompt_text = meal_plan_prompt
        prompt.description = "System prompt for generating personalized meal plans based on user responses"
        prompt.is_active = True
    else:
        # Create new prompt
        prompt = SystemPrompt(
            name="meal_plan",
            prompt_text=meal_plan_prompt,
            description="System prompt for generating personalized meal plans based on user responses",
            is_active=True,
            created_by_id=created_by_id
        )
        db.add(prompt)
    
    db.commit()
    db.refresh(prompt)
    return prompt 
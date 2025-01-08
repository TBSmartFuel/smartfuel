from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.models import User, Question, UserResponse, MealPlan, SystemPrompt
from ..schemas.admin import (
    AdminStats,
    UserStats,
    QuestionStats,
    MealPlanStats,
    SystemHealth
)
from ..schemas.question import QuestionResponse, QuestionCreate, QuestionUpdate
from ..schemas.system_prompt import SystemPrompt as SystemPromptSchema, SystemPromptCreate, SystemPromptUpdate
from ..services.auth import get_current_user, get_current_admin_user
from datetime import datetime, timedelta
from sqlalchemy import func

router = APIRouter()

@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get overall system statistics (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view statistics"
        )
    
    # User statistics
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    admin_users = db.query(User).filter(User.is_admin == True).count()
    user_stats = UserStats(
        total_users=total_users,
        active_users=active_users,
        admin_users=admin_users
    )
    
    # Question statistics
    total_questions = db.query(Question).count()
    active_questions = db.query(Question).filter(Question.is_active == True).count()
    question_stats = QuestionStats(
        total_questions=total_questions,
        active_questions=active_questions
    )
    
    # Meal plan statistics
    total_meal_plans = db.query(MealPlan).count()
    active_meal_plans = db.query(MealPlan).filter(MealPlan.is_active == True).count()
    meal_plan_stats = MealPlanStats(
        total_meal_plans=total_meal_plans,
        active_meal_plans=active_meal_plans
    )
    
    # System health
    system_health = SystemHealth(
        database_connected=True,
        api_version="1.0.0",
        last_backup=None  # TODO: Implement backup tracking
    )
    
    return AdminStats(
        user_stats=user_stats,
        question_stats=question_stats,
        meal_plan_stats=meal_plan_stats,
        system_health=system_health
    )

@router.get("/users/{user_id}/responses")
async def get_user_responses(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all responses for a specific user (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view user responses"
        )
    
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get all responses with question text
    responses = db.query(UserResponse, Question)\
        .join(Question, UserResponse.question_id == Question.id)\
        .filter(UserResponse.user_id == user_id)\
        .all()
    
    formatted_responses = []
    for response, question in responses:
        formatted_responses.append({
            "question_id": question.id,
            "question_text": question.text,
            "response": response.response_value,
            "created_at": response.created_at
        })
    
    return {
        "user_id": user_id,
        "email": user.email,
        "responses": formatted_responses
    }

@router.get("/meal-plans/stats")
async def get_meal_plan_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed meal plan statistics (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view meal plan statistics"
        )
    
    total_meal_plans = db.query(MealPlan).count()
    active_meal_plans = db.query(MealPlan).filter(MealPlan.is_active == True).count()
    users_with_plans = db.query(MealPlan.user_id).distinct().count()
    
    return {
        "total_meal_plans": total_meal_plans,
        "active_meal_plans": active_meal_plans,
        "users_with_plans": users_with_plans,
        "average_plans_per_user": total_meal_plans / users_with_plans if users_with_plans > 0 else 0
    }

@router.get("/questions/stats")
async def get_question_stats(
    time_range: str = "7d",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed question statistics (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view question statistics"
        )
    
    try:
        # Calculate the date range
        now = datetime.utcnow()
        if time_range == "7d":
            start_date = now - timedelta(days=7)
        elif time_range == "30d":
            start_date = now - timedelta(days=30)
        elif time_range == "90d":
            start_date = now - timedelta(days=90)
        else:
            start_date = now - timedelta(days=7)  # Default to 7 days

        total_questions = db.query(Question).count()
        active_questions = db.query(Question).filter(Question.is_active == True).count()
        
        # Get response counts per question within the time range
        response_counts = db.query(
            UserResponse.question_id,
            Question.text,
            func.count(UserResponse.id).label('response_count')
        )\
            .join(Question)\
            .filter(UserResponse.created_at >= start_date)\
            .group_by(UserResponse.question_id, Question.text)\
            .all()
        
        question_stats = []
        for question_id, question_text, response_count in response_counts:
            question_stats.append({
                "question_id": question_id,
                "question_text": question_text,
                "response_count": response_count
            })
        
        total_responses = sum(stat["response_count"] for stat in question_stats)
        
        return {
            "total_questions": total_questions,
            "active_questions": active_questions,
            "total_responses": total_responses,
            "average_responses_per_question": total_responses / total_questions if total_questions > 0 else 0,
            "question_stats": question_stats
        }
        
    except Exception as e:
        print(f"Error in get_question_stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching question statistics: {str(e)}"
        )

@router.get("/questions", response_model=List[QuestionResponse])
async def get_questions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all questions for admin management"""
    questions = db.query(Question).order_by(Question.order).all()
    return questions

@router.post("/questions", response_model=QuestionResponse)
async def create_question(
    question: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new question"""
    db_question = Question(**question.dict())
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

@router.put("/questions/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: int,
    question: QuestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update an existing question"""
    db_question = db.query(Question).filter(Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    for key, value in question.dict(exclude_unset=True).items():
        setattr(db_question, key, value)
    
    db.commit()
    db.refresh(db_question)
    return db_question

@router.delete("/questions/{question_id}")
async def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a question"""
    db_question = db.query(Question).filter(Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    db.delete(db_question)
    db.commit()
    return {"detail": "Question deleted"}

@router.post("/questions/reorder")
async def reorder_questions(
    question_orders: List[dict],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update question orders"""
    for order_data in question_orders:
        question = db.query(Question).filter(Question.id == order_data["id"]).first()
        if question:
            question.order = order_data["order"]
    
    db.commit()
    return {"detail": "Questions reordered successfully"}

@router.get("/users/pending")
async def get_pending_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all users pending approval"""
    pending_users = db.query(User).filter(
        User.is_approved == False,
        User.is_active == True
    ).all()
    
    return [{
        "id": user.id,
        "email": user.email,
        "full_name": "",  # Add this field to User model if needed
        "created_at": user.created_at
    } for user in pending_users]

@router.post("/users/{user_id}/approve")
async def approve_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Approve a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_approved = True
    db.commit()
    return {"message": "User approved successfully"}

@router.post("/users/{user_id}/reject")
async def reject_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Reject a user by deactivating their account"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = False
    user.is_approved = False
    db.commit()
    return {"message": "User rejected successfully"}

# System Prompts endpoints
@router.get("/system-prompts", response_model=List[SystemPromptSchema])
async def get_system_prompts(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all system prompts"""
    query = db.query(SystemPrompt)
    if active_only:
        query = query.filter(SystemPrompt.is_active == True)
    return query.offset(skip).limit(limit).all()

@router.post("/system-prompts", response_model=SystemPromptSchema)
async def create_system_prompt(
    prompt: SystemPromptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new system prompt"""
    db_prompt = SystemPrompt(**prompt.model_dump(), created_by_id=current_user.id)
    db.add(db_prompt)
    db.commit()
    db.refresh(db_prompt)
    return db_prompt

@router.get("/system-prompts/{prompt_id}", response_model=SystemPromptSchema)
async def get_system_prompt(
    prompt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get a specific system prompt"""
    db_prompt = db.query(SystemPrompt).filter(SystemPrompt.id == prompt_id).first()
    if not db_prompt:
        raise HTTPException(status_code=404, detail="System prompt not found")
    return db_prompt

@router.put("/system-prompts/{prompt_id}", response_model=SystemPromptSchema)
async def update_system_prompt(
    prompt_id: int,
    prompt: SystemPromptUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a system prompt"""
    db_prompt = db.query(SystemPrompt).filter(SystemPrompt.id == prompt_id).first()
    if not db_prompt:
        raise HTTPException(status_code=404, detail="System prompt not found")
    
    update_data = prompt.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_prompt, field, value)
    
    db.commit()
    db.refresh(db_prompt)
    return db_prompt

@router.delete("/system-prompts/{prompt_id}")
async def delete_system_prompt(
    prompt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a system prompt"""
    db_prompt = db.query(SystemPrompt).filter(SystemPrompt.id == prompt_id).first()
    if not db_prompt:
        raise HTTPException(status_code=404, detail="System prompt not found")
    
    db.delete(db_prompt)
    db.commit()
    return {"detail": "System prompt deleted successfully"}

@router.post("/system-prompts/{prompt_id}/toggle-active", response_model=SystemPromptSchema)
async def toggle_system_prompt_active(
    prompt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Toggle the active status of a system prompt"""
    db_prompt = db.query(SystemPrompt).filter(SystemPrompt.id == prompt_id).first()
    if not db_prompt:
        raise HTTPException(status_code=404, detail="System prompt not found")
    
    db_prompt.is_active = not db_prompt.is_active
    db.commit()
    db.refresh(db_prompt)
    return db_prompt 
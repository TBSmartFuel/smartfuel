from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from typing import List
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import User, SystemPrompt
from utils.auth import get_current_active_user, User
from utils.crud import crud
from utils.models import SystemPromptResponse

router = APIRouter()

@router.get("/list-all", response_model=List[SystemPromptResponse])
def list_all_prompts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all system prompts with their names and active status"""
    prompts = crud.get_system_prompts(db, active_only=False)
    print("[System Prompts] Found prompts:")
    for prompt in prompts:
        print(f"- Name: {prompt.name}, Active: {prompt.is_active}, ID: {prompt.id}")
    return prompts 
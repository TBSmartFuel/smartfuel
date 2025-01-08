from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ...core.auth import get_current_admin_user
from ...crud import system_prompt as crud
from ...schemas.system_prompt import SystemPrompt, SystemPromptCreate, SystemPromptUpdate
from ...schemas.user import User
from ...database import get_db

router = APIRouter()

@router.get("/", response_model=List[SystemPrompt])
def get_system_prompts(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get all system prompts. Only accessible by admin users.
    """
    return crud.get_system_prompts(db, skip=skip, limit=limit, active_only=active_only)

@router.post("/", response_model=SystemPrompt)
def create_system_prompt(
    prompt: SystemPromptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Create a new system prompt. Only accessible by admin users.
    """
    db_prompt = crud.get_system_prompt_by_name(db, name=prompt.name)
    if db_prompt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="System prompt with this name already exists"
        )
    return crud.create_system_prompt(db=db, prompt=prompt, created_by_id=current_user.id)

@router.get("/{prompt_id}", response_model=SystemPrompt)
def get_system_prompt(
    prompt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get a specific system prompt by ID. Only accessible by admin users.
    """
    db_prompt = crud.get_system_prompt(db, prompt_id=prompt_id)
    if not db_prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System prompt not found"
        )
    return db_prompt

@router.put("/{prompt_id}", response_model=SystemPrompt)
def update_system_prompt(
    prompt_id: int,
    prompt: SystemPromptUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Update a system prompt. Only accessible by admin users.
    """
    db_prompt = crud.update_system_prompt(db, prompt_id=prompt_id, prompt=prompt)
    if not db_prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System prompt not found"
        )
    return db_prompt

@router.delete("/{prompt_id}")
def delete_system_prompt(
    prompt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Delete a system prompt. Only accessible by admin users.
    """
    success = crud.delete_system_prompt(db, prompt_id=prompt_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System prompt not found"
        )
    return {"detail": "System prompt deleted successfully"}

@router.post("/{prompt_id}/toggle-active", response_model=SystemPrompt)
def toggle_system_prompt_active(
    prompt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Toggle the active status of a system prompt. Only accessible by admin users.
    """
    db_prompt = crud.toggle_system_prompt_active(db, prompt_id=prompt_id)
    if not db_prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System prompt not found"
        )
    return db_prompt 
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SystemPromptBase(BaseModel):
    name: str
    prompt_text: str
    description: Optional[str] = None

class SystemPromptCreate(SystemPromptBase):
    pass

class SystemPromptUpdate(BaseModel):
    name: Optional[str] = None
    prompt_text: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class SystemPrompt(SystemPromptBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    created_by_id: int

    class Config:
        from_attributes = True 
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class InteractionBase(BaseModel):
    hcp_name: str
    specialty: Optional[str] = None
    channel: Optional[str] = None
    raw_notes: Optional[str] = None

class InteractionCreate(InteractionBase):
    pass

class InteractionUpdate(BaseModel):
    specialty: Optional[str] = None
    channel: Optional[str] = None
    raw_notes: Optional[str] = None
    llm_summary: Optional[str] = None
    key_entities: Optional[str] = None
    next_steps: Optional[str] = None

class InteractionOut(InteractionBase):
    id: int
    interaction_datetime: datetime
    llm_summary: Optional[str] = None
    key_entities: Optional[str] = None
    next_steps: Optional[str] = None

    class Config:
        from_attributes = True
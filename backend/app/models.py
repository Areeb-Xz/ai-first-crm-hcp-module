from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from .db import Base

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    hcp_name = Column(String(255), index=True)
    specialty = Column(String(255), nullable=True)
    channel = Column(String(100), nullable=True)  # e.g. "in-person", "email", "call"
    interaction_datetime = Column(DateTime(timezone=True), server_default=func.now())
    raw_notes = Column(Text, nullable=True)       # free-text from rep
    llm_summary = Column(Text, nullable=True)     # AI summary
    key_entities = Column(Text, nullable=True)    # serialized JSON of extracted entities
    next_steps = Column(Text, nullable=True)      # AI-suggested follow-ups
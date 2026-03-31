from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from typing import List
from langchain_core.messages import HumanMessage
from .db import Base, engine, SessionLocal
from . import models, schemas
from .langgraph_agent import app_graph

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI-First CRM HCP Module")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---- Form-based CRUD ----

@app.post("/api/interactions", response_model=schemas.InteractionOut)
def create_interaction(data: schemas.InteractionCreate, db: Session = Depends(get_db)):
    interaction = models.Interaction(**data.model_dump())
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    return interaction

@app.get("/api/interactions", response_model=List[schemas.InteractionOut])
def list_interactions(db: Session = Depends(get_db)):
    return db.query(models.Interaction).all()

@app.get("/api/interactions/{interaction_id}", response_model=schemas.InteractionOut)
def get_interaction(interaction_id: int, db: Session = Depends(get_db)):
    return db.query(models.Interaction).get(interaction_id)

@app.put("/api/interactions/{interaction_id}", response_model=schemas.InteractionOut)
def update_interaction(
    interaction_id: int,
    data: schemas.InteractionUpdate,
    db: Session = Depends(get_db),
):
    interaction = db.query(models.Interaction).get(interaction_id)
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(interaction, k, v)
    db.commit()
    db.refresh(interaction)
    return interaction

# ---- Chat-based AI interface ----

class ChatRequest(schemas.BaseModel):
    message: str

class ChatResponse(schemas.BaseModel):
    messages: List[str]

@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    state = {"messages": [HumanMessage(content=req.message)]}
    result = app_graph.invoke(state)
    texts = [m.content for m in result["messages"]]
    return ChatResponse(messages=texts)
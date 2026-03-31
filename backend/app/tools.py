from typing import TypedDict, List, Dict, Any
from sqlalchemy.orm import Session
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from .db import SessionLocal
from . import models
from .config import GROQ_MODEL
from groq import Groq
from .config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

class AgentState(TypedDict):
    messages: List[BaseMessage]

def _get_db() -> Session:
    return SessionLocal()

# 1) Log Interaction
def log_interaction_tool(state: AgentState) -> AgentState:
    """Create an interaction from the last user message (raw notes)."""
    db = _get_db()
    last = state["messages"][-1]
    if not isinstance(last, HumanMessage):
        return state

    
    prompt = f"""
You are a CRM assistant for pharma reps.
Extract: HCP name, specialty, channel, and raw notes from this text.
Return JSON with keys: hcp_name, specialty, channel, raw_notes.

Text:
{last.content}
"""

    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
    )
    content = completion.choices[0].message.content

    interaction = models.Interaction(
        hcp_name="Unknown",
        specialty=None,
        channel=None,
        raw_notes=last.content,
    )
    db.add(interaction)
    db.commit()
    db.refresh(interaction)

    state["messages"].append(
        AIMessage(content=f"Interaction logged with id={interaction.id}.")
    )
    return state

# 2) Edit Interaction
def edit_interaction_tool(state: AgentState) -> AgentState:
    """Edit an existing interaction based on user instructions."""
    db = _get_db()
    last = state["messages"][-1]
    if not isinstance(last, HumanMessage):
        return state
    
    text = last.content

    import re
    m = re.search(r"interaction\s+(\d+)", text, re.IGNORECASE)
    if not m:
        state["messages"].append(
            AIMessage(content="Please specify which interaction id to edit.")
        )
        return state

    interaction_id = int(m.group(1))
    interaction = db.query(models.Interaction).get(interaction_id)
    if not interaction:
        state["messages"].append(
            AIMessage(content=f"No interaction found with id={interaction_id}.")
        )
        return state

    interaction.raw_notes = text
    db.commit()
    db.refresh(interaction)

    state["messages"].append(
        AIMessage(content=f"Interaction {interaction_id} updated.")
    )
    return state

# 3) Get Interaction History
def get_interaction_history_tool(state: AgentState) -> AgentState:
    db = _get_db()
    last = state["messages"][-1]
    if not isinstance(last, HumanMessage):
        return state

    text = last.content
    hcp_name = text.replace("Show history for", "").strip()

    q = db.query(models.Interaction).filter(
        models.Interaction.hcp_name.ilike(f"%{hcp_name}%")
    )
    interactions = q.order_by(models.Interaction.interaction_datetime.desc()).all()

    if not interactions:
        state["messages"].append(AIMessage(content=f"No history for {hcp_name}."))
        return state

    lines = []
    for i in interactions:
        lines.append(
            f"[{i.id}] {i.interaction_datetime} - {i.channel or 'unknown'} - {i.raw_notes[:100]}..."
        )

    state["messages"].append(
        AIMessage(content="Interaction history:\n" + "\n".join(lines))
    )
    return state

# 4) Next Best Action
def suggest_next_best_action_tool(state: AgentState) -> AgentState:
    db = _get_db()
    last = state["messages"][-1]
    if not isinstance(last, HumanMessage):
        return state

    text = last.content
    hcp_name = text.replace("Suggest next best action for", "").strip()

    q = db.query(models.Interaction).filter(
        models.Interaction.hcp_name.ilike(f"%{hcp_name}%")
    )
    interactions = q.order_by(models.Interaction.interaction_datetime.desc()).all()

    history_text = "\n".join(
        f"{i.interaction_datetime}: {i.raw_notes}" for i in interactions
    ) or "No prior interactions."

    prompt = f"""
You are a pharma field-rep assistant.
Given the interaction history with {hcp_name}, suggest 3 next best actions.

History:
{history_text}
"""

    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
    )
    suggestion = completion.choices[0].message.content

    state["messages"].append(AIMessage(content=suggestion))
    return state

# 5) HCP Profile Summary
def summarize_hcp_profile_tool(state: AgentState) -> AgentState:
    db = _get_db()
    last = state["messages"][-1]
    if not isinstance(last, HumanMessage):
        return state

    text = last.content
    hcp_name = text.replace("Summarize profile for", "").strip()

    q = db.query(models.Interaction).filter(
        models.Interaction.hcp_name.ilike(f"%{hcp_name}%")
    )
    interactions = q.order_by(models.Interaction.interaction_datetime.asc()).all()

    history_text = "\n".join(
        f"{i.interaction_datetime}: {i.raw_notes}" for i in interactions
    ) or "No prior interactions."

    prompt = f"""
You are a CRM assistant.
Create a concise HCP profile for {hcp_name} based on these interactions:
- Key interests
- Objections
- Preferred channel
- Suggested talking points next visit

History:
{history_text}
"""

    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
    )
    summary = completion.choices[0].message.content

    state["messages"].append(AIMessage(content=summary))
    return state
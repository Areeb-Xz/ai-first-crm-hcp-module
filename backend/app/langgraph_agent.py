from typing import List, TypedDict
from groq import Groq
from langgraph.graph import StateGraph
from langchain_core.messages import AIMessage, HumanMessage, BaseMessage
from .config import GROQ_API_KEY, GROQ_MODEL
from .tools import (
    log_interaction_tool,
    edit_interaction_tool,
    get_interaction_history_tool,
    suggest_next_best_action_tool,
    summarize_hcp_profile_tool,
)

# ----- LangGraph state -----

class AgentState(TypedDict):
    messages: List[BaseMessage]

client = Groq(api_key=GROQ_API_KEY)

def call_llm(state: AgentState) -> AgentState:
    """LLM node: talk to Groq gemma2-9b-it."""
    messages = state["messages"]
    formatted = []
    for m in messages:
        role = "user" if isinstance(m, HumanMessage) else "assistant"
        formatted.append({"role": role, "content": m.content})

    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=formatted,
    )

    answer = completion.choices[0].message.content
    messages.append(AIMessage(content=answer))
    return {"messages": messages}

# ----- Build graph with tools -----

def build_graph():
    graph = StateGraph(AgentState)

    # Core LLM node
    graph.add_node("llm", call_llm)

    # Tool nodes (each wraps a specific sales/CRM function)
    graph.add_node("log_interaction", log_interaction_tool)
    graph.add_node("edit_interaction", edit_interaction_tool)
    graph.add_node("get_history", get_interaction_history_tool)
    graph.add_node("nba", suggest_next_best_action_tool)
    graph.add_node("summary", summarize_hcp_profile_tool)

    graph.set_entry_point("llm")
    graph.set_finish_point("llm")

    return graph.compile()

app_graph = build_graph()
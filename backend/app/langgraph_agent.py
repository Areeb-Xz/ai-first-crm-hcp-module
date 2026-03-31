from typing import List, TypedDict
from groq import Groq
from langgraph.graph import StateGraph
from langchain_core.messages import AIMessage, HumanMessage, BaseMessage
from .config import GROQ_API_KEY, GROQ_MODEL
from langchain_core.messages import HumanMessage as HM
from langgraph.graph import END
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
    messages = state["messages"]
    formatted = [
        {
            "role": "system",
            "content": (
                "You are a CRM assistant for pharmaceutical field representatives. "
                "When asked to log an interaction, respond with a concise, structured summary "
                "confirming the details captured: HCP name, specialty, channel, and key discussion points. "
                "Be direct and factual. Do not use placeholders like [Current Date] or [patient name]. "
                "Use only the information provided in the message."
            )
        }
    ]
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

def route(state: AgentState):
    last = state["messages"][-1]
    if not isinstance(last, HM):
        return "llm"
    text = last.content.lower()
    if "log interaction" in text or "log an interaction" in text:
        return "log_interaction"
    if "edit interaction" in text:
        return "edit_interaction"
    if "show history" in text or "history for" in text:
        return "get_history"
    if "next best action" in text or "suggest" in text:
        return "nba"
    if "summarize profile" in text or "summary for" in text:
        return "summary"
    return "llm"

def build_graph():
    from langgraph.graph import StateGraph, END

    graph = StateGraph(AgentState)

    graph.add_node("llm", call_llm)
    graph.add_node("log_interaction", log_interaction_tool)
    graph.add_node("edit_interaction", edit_interaction_tool)
    graph.add_node("get_history", get_interaction_history_tool)
    graph.add_node("nba", suggest_next_best_action_tool)
    graph.add_node("summary", summarize_hcp_profile_tool)

    graph.set_conditional_entry_point(
        route,
        {
            "llm": "llm",
            "log_interaction": "log_interaction",
            "edit_interaction": "edit_interaction",
            "get_history": "get_history",
            "nba": "nba",
            "summary": "summary",
        }
    )

    graph.add_edge("llm", END)
    graph.add_edge("log_interaction", END)
    graph.add_edge("edit_interaction", END)
    graph.add_edge("get_history", END)
    graph.add_edge("nba", END)
    graph.add_edge("summary", END)

    return graph.compile()

app_graph = build_graph()
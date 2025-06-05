from langgraph.graph import StateGraph, END
from agent.memory import retrieve_memory
from agent.actions import decide_action, execute_action, escalate_to_king

def build_graph():
    graph = StateGraph()
    graph.add_node("retrieve_context", retrieve_memory)
    graph.add_node("decide_action", decide_action)
    graph.add_node("execute_action", execute_action)
    graph.add_node("escalate", escalate_to_king)

    graph.set_entry_point("retrieve_context")
    graph.add_edge("retrieve_context", "decide_action")
    graph.add_conditional_edges("decide_action", {
        "safe": "execute_action",
        "unsafe": "escalate"
    })
    graph.add_edge("execute_action", END)
    graph.add_edge("escalate", END)

    return graph.compile()

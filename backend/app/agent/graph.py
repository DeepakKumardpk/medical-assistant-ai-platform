from langgraph.graph import END, StateGraph

from app.agent.nodes.respond import respond_node
from app.agent.nodes.retrieve import retrieve_node
from app.agent.state import GraphState

# extract (consuming OCR text produced at upload time) and finalize
# (persisting the message + approval gating) aren't graph nodes: OCR runs
# before this graph is invoked, and DB writes happen in the calling route,
# which already owns a request-scoped session.
#
# classify/generate/simplify/translate were originally four separate LLM
# calls; merged into one respond() call (one prompt, one round trip) since
# that was the actual source of per-message latency -- each call is a
# network round trip, and they ran strictly sequentially.


def build_graph():
    graph = StateGraph(GraphState)
    graph.add_node("retrieve", retrieve_node)
    graph.add_node("respond", respond_node)

    graph.set_entry_point("retrieve")
    graph.add_edge("retrieve", "respond")
    graph.add_edge("respond", END)

    return graph.compile()


_compiled_graph = None


def run_orchestrator(
    *, user_role: str, user_message: str, document_text: str | None, target_language: str
) -> GraphState:
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()

    initial_state: GraphState = {
        "user_role": user_role,
        "user_message": user_message,
        "document_text": document_text,
        "target_language": target_language or "en",
    }
    return _compiled_graph.invoke(initial_state)

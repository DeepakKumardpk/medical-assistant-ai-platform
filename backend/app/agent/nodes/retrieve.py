from app.agent.llm import get_embeddings
from app.agent.state import GraphState
from app.db.models.corpus_chunk import CorpusChunk
from app.db.session import SessionLocal

_TOP_K = 5


def retrieve_node(state: GraphState) -> GraphState:
    query_text = state["user_message"]
    if state.get("document_text"):
        query_text = f"{query_text}\n\n{state['document_text'][:2000]}"

    query_vector = get_embeddings().embed_query(query_text)

    db = SessionLocal()
    try:
        rows = (
            db.query(CorpusChunk)
            .order_by(CorpusChunk.embedding.cosine_distance(query_vector))
            .limit(_TOP_K)
            .all()
        )
        chunks = [f"[{row.source_name}] {row.chunk_text}" for row in rows]
    finally:
        db.close()

    return {**state, "retrieved_chunks": chunks}

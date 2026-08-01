from app.agent.llm import get_chat_model, get_embeddings
from app.db.models.corpus_chunk import CorpusChunk
from app.db.session import SessionLocal

_TOP_K = 6

_PROMPT = """You are assisting a doctor. Using the reference excerpts below, summarize any \
known interactions, precautions, or relevant information about the following drugs: {drugs}. \
Cite the bracketed source name inline when you use a reference. If the references don't cover \
an interaction, say so rather than inventing one.

Reference excerpts:
{references}

Summary:"""


def check_drug_interactions(drug_names: list[str]) -> str:
    query = "Drug interactions and precautions for: " + ", ".join(drug_names)
    query_vector = get_embeddings().embed_query(query)

    db = SessionLocal()
    try:
        rows = (
            db.query(CorpusChunk)
            .order_by(CorpusChunk.embedding.cosine_distance(query_vector))
            .limit(_TOP_K)
            .all()
        )
        references = "\n\n".join(f"[{row.source_name}] {row.chunk_text}" for row in rows) or "(none)"
    finally:
        db.close()

    llm = get_chat_model()
    response = llm.invoke(_PROMPT.format(drugs=", ".join(drug_names), references=references))
    return response.content.strip()

from app.agent.llm import get_embeddings
from app.db.models.corpus_chunk import CorpusChunk
from app.db.session import SessionLocal


def test_top1_retrieval_matches_expected_source():
    # WHO essential medicines list is the only source discussing the WHO
    # Model List of Essential Medicines itself; a query naming it directly
    # should retrieve a chunk from that PDF as the closest match.
    query = "What is the WHO Model List of Essential Medicines?"
    query_vector = get_embeddings().embed_query(query)

    db = SessionLocal()
    try:
        top_chunk = (
            db.query(CorpusChunk)
            .order_by(CorpusChunk.embedding.cosine_distance(query_vector))
            .first()
        )
    finally:
        db.close()

    assert top_chunk is not None
    assert "EML" in top_chunk.source_name

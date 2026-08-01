from langchain_anthropic import ChatAnthropic
from langchain_ollama import ChatOllama, OllamaEmbeddings

from app.config import settings


def get_chat_model(temperature: float = 0.2) -> ChatAnthropic | ChatOllama:
    if settings.anthropic_api_key:
        return ChatAnthropic(
            api_key=settings.anthropic_api_key,
            model=settings.anthropic_model,
            temperature=temperature,
        )
    return ChatOllama(
        base_url=settings.ollama_base_url,
        model=settings.ollama_llm_model,
        temperature=temperature,
    )


def get_embeddings() -> OllamaEmbeddings:
    # RAG embeddings stay on local Ollama regardless -- small/fast model,
    # never the bottleneck, and Anthropic doesn't offer an embeddings API.
    return OllamaEmbeddings(base_url=settings.ollama_base_url, model=settings.ollama_embed_model)

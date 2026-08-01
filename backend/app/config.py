from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24

    ollama_base_url: str = "http://ollama:11434"
    ollama_llm_model: str = "llama3.2:3b"
    ollama_embed_model: str = "nomic-embed-text"

    # When set, chat/generation calls use Claude instead of the local Ollama
    # model (embeddings/RAG still use Ollama -- that part was never the
    # bottleneck). Leave unset to keep the fully self-hosted/free setup.
    anthropic_api_key: str | None = None
    anthropic_model: str = "claude-haiku-4-5-20251001"

    upload_dir: str = "/data/uploads"

    # Bypasses the doctor-approval queue so patient-facing AI answers are
    # visible immediately. Was needed pre-milestone-5 (no approval queue
    # existed yet to unblock messages); now the real gate is the default.
    dev_auto_approve: bool = False


settings = Settings()

from functools import lru_cache
from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[2]
PROJECT_ENV_FILE = PROJECT_ROOT / ".env"


class Settings(BaseSettings):
    # Compose and native development intentionally share the repository-root .env.
    model_config = SettingsConfigDict(env_file=PROJECT_ENV_FILE, extra="ignore")

    mongo_url: str = "mongodb://localhost:27017"
    mongo_db: str = "swiftly"
    data_dir: Path = Field(default=Path("./data"))
    openai_api_key: str | None = None
    openai_model: str = "gpt-5"


@lru_cache
def settings() -> Settings:
    value = Settings()
    if not value.data_dir.is_absolute():
        value.data_dir = (PROJECT_ROOT / value.data_dir).resolve()
    value.data_dir.mkdir(parents=True, exist_ok=True)
    (value.data_dir / "uploads").mkdir(exist_ok=True)
    (value.data_dir / "rendered").mkdir(exist_ok=True)
    (value.data_dir / "images").mkdir(exist_ok=True)
    return value

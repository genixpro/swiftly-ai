import pytest

from app.settings import settings


@pytest.fixture(autouse=True)
def isolate_provider_credentials(monkeypatch):
    """Unit and contract tests must never use a developer's real provider key."""
    monkeypatch.setenv("OPENAI_API_KEY", "")
    settings.cache_clear()
    yield
    settings.cache_clear()

import app.settings as settings_module
from app.settings import Settings


def test_native_dotenv_configuration_is_supported(tmp_path):
    env_file = tmp_path / ".env"
    env_file.write_text("MONGO_URL=mongodb://localhost:27017\nMONGO_DB=native_demo\nOPENAI_MODEL=gpt-5-test\n")

    config = Settings(_env_file=env_file)

    assert config.mongo_url == "mongodb://localhost:27017"
    assert config.mongo_db == "native_demo"
    assert config.openai_model == "gpt-5-test"


def test_relative_data_dir_is_rooted_at_the_repository(monkeypatch, tmp_path):
    monkeypatch.setenv("DATA_DIR", "local-demo-data")
    monkeypatch.setattr(settings_module, "PROJECT_ROOT", tmp_path)
    settings_module.settings.cache_clear()
    config = settings_module.settings()
    assert config.data_dir == tmp_path / "local-demo-data"
    settings_module.settings.cache_clear()

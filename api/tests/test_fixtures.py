import json
from pathlib import Path

from app.schemas import ExtractionResult


FIXTURES = Path(__file__).parents[1] / "fixtures"


def test_fixture_manifest_has_expected_outputs_for_each_document_type():
    manifest = json.loads((FIXTURES / "manifest.json").read_text())
    for fixture in manifest["fixtures"]:
        assert (FIXTURES / fixture["source"]).is_file()
        expected = ExtractionResult.model_validate_json((FIXTURES / fixture["expected"]).read_text())
        assert expected.document_type == fixture["type"]

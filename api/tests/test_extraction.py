from pathlib import Path
from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from app.extraction import OpenAIResponsesProvider, normalize_extraction, provider_for
from app.schemas import ExtractionResult
from app.settings import Settings


def extraction_payload(**overrides):
    payload = {
        "document_type": "lease", "confidence": 0.9,
        "fields": [{"name": "tenantName", "value": "Northstar", "citations": [{"page": 1, "text": "Tenant: Northstar"}]}],
        "tenant_lease_rows": [], "income_expense_rows": [], "comparable_sales": [],
        "citations": [{"page": 1, "text": "Tenant: Northstar"}],
    }
    payload.update(overrides)
    return payload


class FakeResponses:
    def __init__(self, output_text):
        self.output_text = output_text
        self.request = None

    def create(self, **kwargs):
        self.request = kwargs
        return SimpleNamespace(output_text=self.output_text)


class FakeFiles:
    def __init__(self):
        self.created = []
        self.deleted = []

    def create(self, *, file, purpose):
        self.created.append((Path(file.name).name, purpose))
        return SimpleNamespace(id="file-temporary")

    def delete(self, file_id):
        self.deleted.append(file_id)


def test_openai_provider_uses_strict_schema_original_file_and_page_image_input(tmp_path):
    image = tmp_path / "page.png"; image.write_bytes(b"png-data")
    source = tmp_path / "lease.pdf"; source.write_bytes(b"pdf-data")
    responses = FakeResponses(ExtractionResult(**extraction_payload()).model_dump_json())
    files = FakeFiles()
    provider = OpenAIResponsesProvider(Settings(openai_api_key="test-key"))
    provider.client = SimpleNamespace(responses=responses, files=files)

    result = provider.extract(source, "[Page 1] Tenant: Northstar", [image])

    assert result.document_type == "lease"
    assert responses.request["text"]["format"]["strict"] is True
    assert responses.request["text"]["format"]["schema"]["title"] == "ExtractionResult"
    assert [item["type"] for item in responses.request["input"][0]["content"]] == ["input_text", "input_file", "input_image"]
    assert files.created == [("lease.pdf", "user_data")]
    assert files.deleted == ["file-temporary"]


def test_malformed_provider_response_is_rejected_for_manual_reprocess():
    source = Path(__file__).parent.parent / "fixtures" / "financial-statement.pdf"
    provider = OpenAIResponsesProvider(Settings(openai_api_key="test-key"))
    provider.client = SimpleNamespace(responses=FakeResponses('{"document_type":"lease"}'), files=FakeFiles())
    with pytest.raises(ValidationError):
        provider.extract(source, "", [])


def test_normalized_results_retain_the_canonical_extraction():
    normalized = normalize_extraction(ExtractionResult(**extraction_payload()))
    assert normalized["fileType"] == "lease"
    assert normalized["extractedData"] == {"tenantName": "Northstar"}
    assert normalized["extraction"]["fields"][0]["citations"] == [{"page": 1, "text": "Tenant: Northstar"}]
    assert provider_for(Settings()).__class__.__name__ == "UnconfiguredProvider"


def test_canonical_document_types_map_to_legacy_file_filters():
    result = ExtractionResult(**extraction_payload(document_type="financial_statement"))
    assert normalize_extraction(result)["fileType"] == "financials"

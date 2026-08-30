"""Provider-neutral document extraction with OpenAI Responses as the default."""
from __future__ import annotations

import base64
import logging
from pathlib import Path
from typing import Protocol, Sequence

from openai import OpenAI

from .schemas import ExtractionResult
from .settings import Settings


log = logging.getLogger(__name__)
IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp"}
LEGACY_FILE_TYPES = {
    "financial_statement": "financials",
    "rent_roll": "rentroll",
    "comparable_sale": "comparable",
    "comparable_lease": "comparable_lease",
}

EXTRACTION_INSTRUCTIONS = """Extract commercial real-estate appraisal data. Cite every value with a 1-based page
number and the smallest supporting text excerpt. Do not invent values; omit unknown fields. Classify the document and
return tenant/lease, income/expense, and comparable-sale rows only when present."""


class ExtractionProvider(Protocol):
    def extract(self, source: Path, extracted_text: str, page_images: Sequence[Path]) -> ExtractionResult: ...


class OpenAIResponsesProvider:
    def __init__(self, config: Settings):
        self.client = OpenAI(api_key=config.openai_api_key)
        self.model = config.openai_model

    def extract(self, source: Path, extracted_text: str, page_images: Sequence[Path]) -> ExtractionResult:
        content: list[dict[str, object]] = [{"type": "input_text", "text": extracted_text[:120_000]}]
        # Preserve the original, machine-readable document alongside page images.
        # Image uploads already travel as image inputs below and need no duplicate.
        uploaded_file_id: str | None = None
        if source.suffix.lower() not in IMAGE_SUFFIXES:
            with source.open("rb") as source_handle:
                uploaded = self.client.files.create(file=source_handle, purpose="user_data")
            uploaded_file_id = uploaded.id
            content.append({"type": "input_file", "file_id": uploaded_file_id})
        for image in page_images[:10]:
            encoded = base64.b64encode(image.read_bytes()).decode("ascii")
            mime_type = "image/jpeg" if image.suffix.lower() in {".jpg", ".jpeg"} else f"image/{image.suffix.lower().lstrip('.')}"
            content.append({"type": "input_image", "image_url": f"data:{mime_type};base64,{encoded}"})
        try:
            response = self.client.responses.create(
                model=self.model,
                instructions=EXTRACTION_INSTRUCTIONS,
                input=[{"role": "user", "content": content}],
                text={"format": {"type": "json_schema", "name": "appraisal_extraction", "strict": True,
                                  "schema": ExtractionResult.model_json_schema() }},
            )
            return ExtractionResult.model_validate_json(response.output_text)
        finally:
            if uploaded_file_id:
                try:
                    self.client.files.delete(uploaded_file_id)
                except Exception:
                    # Cleanup failure must not hide an otherwise useful extraction.
                    log.warning("could not delete temporary OpenAI extraction file", extra={"fileId": uploaded_file_id})


class UnconfiguredProvider:
    def extract(self, source: Path, extracted_text: str, page_images: Sequence[Path]) -> ExtractionResult:
        raise RuntimeError("OPENAI_API_KEY is not configured; add it to .env and reprocess this file.")


def provider_for(config: Settings) -> ExtractionProvider:
    return OpenAIResponsesProvider(config) if config.openai_api_key else UnconfiguredProvider()


def normalize_for_legacy(result: ExtractionResult) -> dict[str, object]:
    """Keep corrections editable in the legacy file shape while retaining the canonical result."""
    annotations = []
    fields = {field.name: field.value for field in result.fields}
    for field in result.fields:
        annotations.append({"classification": field.name, "text": str(field.value), "citations": [c.model_dump() for c in field.citations]})
    return {"fileType": LEGACY_FILE_TYPES.get(result.document_type, result.document_type), "extractedData": fields, "annotations": annotations,
            "tenantLeaseRows": [row.model_dump() for row in result.tenant_lease_rows],
            "incomeExpenseRows": [row.model_dump() for row in result.income_expense_rows],
            "comparableSales": [row.model_dump() for row in result.comparable_sales]}

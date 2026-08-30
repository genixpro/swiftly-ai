from typing import Any, Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator


class Citation(BaseModel):
    model_config = ConfigDict(extra="forbid")
    page: int = Field(ge=1)
    text: str = Field(min_length=1, max_length=1000)


class ExtractedField(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(min_length=1)
    value: str | int | float | bool | None
    citations: list[Citation]


class ExtractedRow(BaseModel):
    model_config = ConfigDict(extra="forbid")
    values: list[ExtractedField]
    citations: list[Citation]


class ExtractionResult(BaseModel):
    model_config = ConfigDict(extra="forbid")
    document_type: Literal["lease", "rent_roll", "financial_statement", "comparable_sale", "comparable_lease", "other"]
    confidence: float = Field(ge=0, le=1)
    fields: list[ExtractedField]
    tenant_lease_rows: list[ExtractedRow]
    income_expense_rows: list[ExtractedRow]
    comparable_sales: list[ExtractedRow]
    citations: list[Citation]

    @model_validator(mode="after")
    def citations_are_unique(self):
        seen: set[tuple[int, str]] = set()
        self.citations = [citation for citation in self.citations if not ((citation.page, citation.text) in seen or seen.add((citation.page, citation.text)))]
        return self


class ExtractionPatch(BaseModel):
    extraction: ExtractionResult


class FileMetadataPatch(BaseModel):
    """Explicit allowlist of client-editable file review metadata."""

    model_config = ConfigDict(extra="forbid")
    fileType: str | None = Field(default=None, min_length=1, max_length=100)
    extractedData: dict[str, Any] | None = None

    @model_validator(mode="after")
    def contains_an_update(self):
        if self.fileType is None and self.extractedData is None:
            raise ValueError("At least one editable file field is required")
        return self

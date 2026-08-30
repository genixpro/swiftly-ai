from app.schemas import ExtractionResult


def test_extraction_schema_rejects_invalid_confidence():
    try:
        ExtractionResult(document_type="lease", confidence=1.2, fields=[], tenant_lease_rows=[], income_expense_rows=[], comparable_sales=[], citations=[])
    except ValueError:
        return
    raise AssertionError("confidence outside 0..1 must be rejected")


def test_extraction_schema_accepts_partial_result():
    result = ExtractionResult(document_type="other", confidence=0, fields=[], tenant_lease_rows=[], income_expense_rows=[], comparable_sales=[], citations=[])
    assert result.tenant_lease_rows == []

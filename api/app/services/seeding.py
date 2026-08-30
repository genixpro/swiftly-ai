"""Demo-data seeding helpers."""
from __future__ import annotations

import hashlib
import logging
import shutil
from pathlib import Path

from ..extraction import normalize_extraction
from ..schemas import ExtractionResult
from ..settings import settings
from .file_storage import extract_available_text, render_document_pages

log = logging.getLogger("swiftly")


def seed_demo_files(app, fixture_directory: Path) -> None:
    """Copy versioned sample documents into the local file volume once."""
    cfg, repositories = settings(), app.state.repositories
    documents = (
        (
            "demo-financial-statement",
            "financial-statement.pdf",
            "financial-statement.json",
            "financials",
        ),
        ("demo-lease", "lease.docx", "lease.json", "lease"),
        (
            "demo-comparable-sale",
            "comparable-sale.txt",
            "comparable-sale.json",
            "comparable",
        ),
        (
            "demo-scanned-rent-roll",
            "scanned-placeholder.pdf",
            "partial.json",
            "rentroll",
        ),
    )

    def word_records(values: list[object]) -> list[object]:
        return [
            {
                "word": value,
                "page": 1,
                "index": index,
                "lineNumber": 0,
                "documentLineNumber": 0,
                "column": index,
                "documentColumn": index,
                "left": 0,
                "right": 0,
                "top": 0,
                "bottom": 0,
            }
            if isinstance(value, str)
            else value
            for index, value in enumerate(values)
        ]

    for file_id, source_name, extraction_name, legacy_type in documents:
        existing = repositories.files.find_one({"_id": file_id})
        if existing:
            words = existing.get("words") or []
            if any(isinstance(word, str) for word in words):
                repositories.files.update_one(
                    {"_id": file_id}, {"$set": {"words": word_records(words)}}
                )
            continue
        source = fixture_directory / source_name
        if not source.is_file():
            log.warning("seed fixture is unavailable", extra={"fileId": file_id})
            continue
        destination = cfg.data_dir / "uploads" / f"{file_id}{source.suffix}"
        shutil.copy2(source, destination)
        extracted_text, pages = extract_available_text(destination, source.name)
        extraction = ExtractionResult.model_validate_json(
            (fixture_directory / extraction_name).read_text()
        )
        normalized = normalize_extraction(extraction)
        normalized["fileType"] = legacy_type
        images = render_document_pages(file_id, destination)
        repositories.files.insert_one(
            {
                "_id": file_id,
                "appraisalId": "demo-appraisal",
                "owner": "local-demo",
                "fileName": source_name,
                "path": str(destination),
                "hash": hashlib.sha256(destination.read_bytes()).hexdigest(),
                "reviewStatus": "seeded",
                "pages": pages,
                "images": [str(image) for image in images],
                "words": word_records(extracted_text.split()),
                **normalized,
            }
        )

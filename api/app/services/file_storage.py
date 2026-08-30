"""Managed local storage for uploads, images, and rendered document pages."""
from __future__ import annotations

import hashlib
import shutil
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

import fitz
from docx import Document
from fastapi import HTTPException, UploadFile

from ..settings import Settings, settings

IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
EXTRACTABLE_IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp"}


def _config(config: Settings | None = None) -> Settings:
    return config or settings()


def managed_path(value: str | Path, root: Path) -> Path:
    """Resolve a stored path and reject records that escape their managed root."""
    candidate = Path(value).resolve()
    managed_root = root.resolve()
    if not candidate.is_relative_to(managed_root):
        raise HTTPException(404, "Stored file is unavailable")
    return candidate


def upload_path(value: str | Path, config: Settings | None = None) -> Path:
    return managed_path(value, _config(config).data_dir / "uploads")


def image_path(value: str | Path, config: Settings | None = None) -> Path:
    return managed_path(value, _config(config).data_dir / "images")


def rendered_path(value: str | Path, file_id: str, config: Settings | None = None) -> Path:
    return managed_path(value, _config(config).data_dir / "rendered" / file_id)


def review_page_path(value: str | Path, file_id: str, config: Settings | None = None) -> Path:
    """Resolve a rendered page or the original image used as its own preview."""
    cfg = _config(config)
    try:
        return rendered_path(value, file_id, cfg)
    except HTTPException:
        return upload_path(value, cfg)


def save_image(upload: UploadFile, db, config: Settings | None = None) -> dict:
    suffix = Path(upload.filename or "image").suffix.lower()
    if suffix not in IMAGE_SUFFIXES:
        raise HTTPException(415, "Images must be PNG, JPEG, WebP, or GIF files")
    image_id = str(uuid4())
    destination = _config(config).data_dir / "images" / f"{image_id}{suffix}"
    with destination.open("wb") as target:
        shutil.copyfileobj(upload.file, target)
    record = {
        "_id": image_id,
        "fileName": upload.filename or f"image{suffix}",
        "path": str(destination),
        "contentType": upload.content_type or "application/octet-stream",
        "createdAt": datetime.now(UTC),
    }
    db.images.insert_one(record)
    return record


def save_upload(appraisal_id: str, upload: UploadFile, db, config: Settings | None = None) -> dict:
    file_id = str(uuid4())
    suffix = Path(upload.filename or "upload").suffix
    destination = _config(config).data_dir / "uploads" / f"{file_id}{suffix}"
    with destination.open("wb") as target:
        shutil.copyfileobj(upload.file, target)
    digest = hashlib.sha256(destination.read_bytes()).hexdigest()
    record = {
        "_id": file_id,
        "appraisalId": appraisal_id,
        "owner": "local-demo",
        "fileName": upload.filename or "upload",
        "fileType": "other",
        "reviewStatus": "fresh",
        "path": str(destination),
        "hash": digest,
        "images": [],
        "words": [],
        "pages": 0,
    }
    db.files.insert_one(record)
    return record


def render_document_pages(
    file_id: str,
    source: Path,
    config: Settings | None = None,
) -> list[Path]:
    """Persist reviewable PNGs; OCR-free scanned documents remain visual inputs."""
    output_dir = _config(config).data_dir / "rendered" / file_id
    output_dir.mkdir(parents=True, exist_ok=True)
    if source.suffix.lower() != ".pdf":
        return [source] if source.suffix.lower() in EXTRACTABLE_IMAGE_SUFFIXES else []
    document = fitz.open(source)
    images = []
    for index, page in enumerate(document):
        destination = output_dir / f"page-{index + 1}.png"
        page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False).save(destination)
        images.append(destination)
    return images


def extract_available_text(source: Path, file_name: str) -> tuple[str, int]:
    """Extract locally available text before sending source pages to a provider."""
    suffix = source.suffix.lower()
    if suffix == ".pdf":
        document = fitz.open(source)
        text = "\n\n".join(f"[Page {index + 1}]\n{page.get_text()}" for index, page in enumerate(document))
        return text, document.page_count
    if suffix == ".docx":
        document = Document(source)
        return "[Page 1]\n" + "\n".join(paragraph.text for paragraph in document.paragraphs), 1
    if suffix in {".csv", ".txt", ".tsv"}:
        return "[Page 1]\n" + source.read_text(encoding="utf-8", errors="replace"), 1
    return f"[Page 1] Image upload: {file_name}", 1


def remove_file_assets(record: dict, config: Settings | None = None) -> None:
    """Remove only assets that belong to the managed file record."""
    cfg = _config(config)
    try:
        source = upload_path(record["path"], cfg)
    except (HTTPException, KeyError):
        source = None
    if source:
        source.unlink(missing_ok=True)
    rendered_dir = cfg.data_dir / "rendered" / str(record["_id"])
    shutil.rmtree(rendered_dir, ignore_errors=True)


def public_file(document: dict, serializer) -> dict:
    """Serialize file metadata without exposing server-owned storage details."""
    result = serializer(document)
    for field in ("path", "images", "hash", "owner"):
        result.pop(field, None)
    return result

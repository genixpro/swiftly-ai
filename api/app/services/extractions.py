"""Extraction workflow orchestration.

Routes enqueue work and translate HTTP responses; this module owns the job and
file state transitions so retries and failures can be tested without FastAPI.
"""
from __future__ import annotations

import logging
from datetime import UTC, datetime
from uuid import uuid4

from fastapi import BackgroundTasks

from ..extraction import normalize_extraction, provider_for
from ..settings import settings
from .file_storage import extract_available_text, render_document_pages, upload_path

log = logging.getLogger("swiftly")


def queue_extraction(
    appraisal_id: str,
    file_id: str,
    repositories,
    background_tasks: BackgroundTasks,
) -> str:
    """Create a reviewable job and keep the file's visible state in sync."""
    job_id = str(uuid4())
    repositories.extractions.insert_one(
        {
            "_id": job_id,
            "fileId": file_id,
            "appraisalId": appraisal_id,
            "status": "queued",
            "createdAt": datetime.now(UTC),
        }
    )
    repositories.files.update_one(
        {"_id": file_id, "appraisalId": appraisal_id},
        {
            "$set": {
                "extractionJobId": job_id,
                "reviewStatus": "queued",
                "extractionError": None,
            }
        },
    )
    background_tasks.add_task(run_extraction, job_id, repositories)
    return job_id


def run_extraction(job_id: str, repositories) -> None:
    """Run one extraction and persist every externally observable transition."""
    job = repositories.extractions.find_one({"_id": job_id})
    file = repositories.files.find_one({"_id": job["fileId"]})
    repositories.extractions.update_one(
        {"_id": job_id},
        {"$set": {"status": "running", "startedAt": datetime.now(UTC)}},
    )
    try:
        path = upload_path(file["path"])
        page_images = render_document_pages(file["_id"], path)
        text, pages = extract_available_text(path, file["fileName"])
        image_paths = [str(image) for image in page_images]

        # Local rendering remains useful when the configured provider fails.
        repositories.files.update_one(
            {"_id": file["_id"]},
            {"$set": {"pages": pages, "images": image_paths}},
        )
        result = provider_for(settings()).extract(path, text, page_images)
        normalized = normalize_extraction(result)
        repositories.files.update_one(
            {"_id": file["_id"]},
            {
                "$set": {
                    **normalized,
                    "reviewStatus": "extracted",
                    "extractionError": None,
                    "pages": pages,
                    "images": image_paths,
                },
                "$unset": {"annotations": ""},
            },
        )
        repositories.extractions.update_one(
            {"_id": job_id},
            {
                "$set": {
                    "status": "completed",
                    "result": result.model_dump(),
                    "completedAt": datetime.now(UTC),
                }
            },
        )
    except Exception as exc:
        log.exception(
            "extraction failed",
            extra={
                "jobId": job_id,
                "fileId": file["_id"],
                "appraisalId": job["appraisalId"],
            },
        )
        repositories.extractions.update_one(
            {"_id": job_id},
            {
                "$set": {
                    "status": "failed",
                    "error": str(exc),
                    "completedAt": datetime.now(UTC),
                }
            },
        )
        repositories.files.update_one(
            {"_id": file["_id"]},
            {
                "$set": {
                    "reviewStatus": "extraction_failed",
                    "extractionError": str(exc),
                }
            },
        )

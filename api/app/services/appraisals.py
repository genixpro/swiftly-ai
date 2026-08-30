"""Appraisal workflows kept independent from HTTP routing."""
from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from pymongo import ReturnDocument

from ..calculations import refresh_valuations, unit_is_vacant, unit_tenant_name
from .file_storage import remove_file_assets


def create_appraisal(payload: dict, repositories, prepare_payload) -> str:
    appraisal_id = str(uuid4())
    document = prepare_payload(payload)
    document.update(
        {
            "_id": appraisal_id,
            "owner": "local-demo",
            "createdAt": datetime.now(UTC),
            "updatedAt": datetime.now(UTC),
        }
    )
    repositories.appraisals.insert_one(document)
    return appraisal_id


def update_appraisal(appraisal_id: str, payload: dict, repositories) -> dict | None:
    existing = repositories.appraisals.find_one({"_id": appraisal_id})
    if not existing:
        return None
    calculated = refresh_valuations({**existing, **payload})
    return repositories.appraisals.find_one_and_update(
        {"_id": appraisal_id},
        {"$set": {**payload, **calculated, "updatedAt": datetime.now(UTC)}},
        return_document=ReturnDocument.AFTER,
    )


def delete_appraisal(appraisal_id: str, repositories) -> bool:
    deleted = repositories.appraisals.find_one_and_delete({"_id": appraisal_id})
    if not deleted:
        return False
    for record in repositories.files.find({"appraisalId": appraisal_id}):
        remove_file_assets(record)
    repositories.files.delete_many({"appraisalId": appraisal_id})
    repositories.extractions.delete_many({"appraisalId": appraisal_id})
    return True


def convert_tenants_to_comparables(appraisal_id: str, repositories) -> list[str] | None:
    appraisal = repositories.appraisals.find_one({"_id": appraisal_id})
    if not appraisal:
        return None
    created = []
    for unit in appraisal.get("units", []):
        if unit_is_vacant(unit):
            continue
        comparable = {
            **unit,
            "_id": str(uuid4()),
            "owner": "local-demo",
            "appraisalId": appraisal_id,
            "tenantName": unit_tenant_name(unit),
            "propertyType": appraisal.get("propertyType"),
        }
        repositories.comparable_leases.insert_one(comparable)
        created.append(comparable["_id"])
    return created

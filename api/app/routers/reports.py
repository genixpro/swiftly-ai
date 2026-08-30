from fastapi import APIRouter, HTTPException, Request

from ..services.reporting import export_report_response

router = APIRouter()


@router.get("/appraisals/{appraisal_id}/reports/{report}")
def export_report(appraisal_id: str, report: str, format: str, request: Request):
    appraisal = request.app.state.repositories.appraisals.find_one({"_id": appraisal_id})
    if not appraisal:
        raise HTTPException(404, "Appraisal not found")
    return export_report_response(appraisal, report, format, request.app.state.repositories)

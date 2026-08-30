from app.main import app, public


def test_extraction_contract_routes_are_registered():
    paths = {route.path for route in app.routes}
    assert "/appraisals/{appraisal_id}/files" in paths
    assert "/appraisals/{appraisal_id}/files/{file_id}/extract" in paths
    assert "/extractions/{job_id}" in paths
    assert "/appraisals/{appraisal_id}/files/{file_id}/extraction" in paths


def test_canonical_browser_contract_routes_are_registered():
    paths = {route.path for route in app.routes}
    required = {
        "/appraisals", "/appraisals/{appraisal_id}", "/appraisals/{appraisal_id}/files",
        "/appraisals/{appraisal_id}/files/{file_id}", "/appraisals/{appraisal_id}/files/{file_id}/extract",
        "/appraisals/{appraisal_id}/files/{file_id}/rendered-pages/{page}",
        "/appraisals/{appraisal_id}/comparable-leases/from-tenants", "/comparable-sales", "/comparable-sales/{comparable_id}",
        "/comparable-leases", "/comparable-leases/{comparable_id}", "/comparable-sale-portfolios",
        "/zones", "/zones/{zone_id}", "/property-tags", "/property-tags/{tag_id}", "/tenant-names",
        "/images", "/images/{image_id}", "/comparable-sales/import",
        "/appraisals/{appraisal_id}/reports/{report}",
    }
    assert required <= paths


def test_resource_updates_use_patch_and_not_post():
    methods_by_path = {}
    for route in app.routes:
        if hasattr(route, "methods"):
            methods_by_path.setdefault(route.path, set()).update(route.methods)
    assert methods_by_path["/appraisals/{appraisal_id}"] == {"GET", "PATCH", "DELETE"}
    assert methods_by_path["/comparable-sales/{comparable_id}"] >= {"GET", "PATCH", "DELETE"}
    assert methods_by_path["/appraisals/{appraisal_id}/files/{file_id}"] >= {"GET", "PATCH", "DELETE"}


def test_file_responses_hide_retired_token_annotation_metadata():
    value = public({
        "_id": "file-1",
        "annotations": [{"classification": "tenant"}],
        "words": [{"word": "Tenant", "page": 1, "index": 0, "classificationProbabilities": {"tenant": 0.9}}],
    })

    assert "annotations" not in value
    assert value["words"] == [{"word": "Tenant", "page": 1, "index": 0}]

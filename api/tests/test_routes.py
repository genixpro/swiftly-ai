from app.main import app


def test_extraction_contract_routes_are_registered():
    paths = {route.path for route in app.routes}
    assert "/appraisals/{appraisal_id}/files" in paths
    assert "/appraisals/{appraisal_id}/files/{file_id}/extract" in paths
    assert "/extractions/{job_id}" in paths
    assert "/appraisals/{appraisal_id}/files/{file_id}/extraction" in paths


def test_legacy_browser_contract_routes_are_registered():
    paths = {route.path for route in app.routes}
    required = {
        "/appraisal/", "/appraisal/{appraisal_id}", "/appraisal/{appraisal_id}/files",
        "/appraisal/{appraisal_id}/files/{file_id}", "/appraisal/{appraisal_id}/files/{file_id}/reprocess",
        "/appraisal/{appraisal_id}/files/{file_id}/rendered/{page}",
        "/appraisal/{appraisal_id}/convert_tenants", "/comparable_sales", "/comparable_sales/{comparable_id}",
        "/comparable_leases", "/comparable_leases/{comparable_id}", "/comparable_sales_portfolio/",
        "/zones", "/zone/{zone_id}", "/property_tags", "/property_tags/{tag_id}", "/tenant_names",
        "/images", "/images/{image_id}", "/comparable_sale_upload/",
    }
    assert required <= paths


def test_specific_file_route_precedes_broad_legacy_export_route():
    paths = [route.path for route in app.routes]
    assert paths.index("/appraisal/{appraisal_id}/files/{file_id}") < paths.index("/appraisal/{appraisal_id}/{report}/{format}")

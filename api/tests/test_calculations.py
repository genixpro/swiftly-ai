from app.calculations import direct_comparison, discounted_cash_flow, stabilized_statement, validate_appraisal


def test_stabilized_statement_calculates_noi_and_capitalization():
    result = stabilized_statement({
        "units": [{"yearlyRent": 100_000}],
        "expenses": [{"amount": 20_000}],
        "stabilizedStatementInputs": {"vacancyRate": 5, "capitalizationRate": 5, "structuralAllowancePercent": 0},
    })
    assert result["netOperatingIncome"] == 75_000
    assert result["capitalization"] == 1_500_000


def test_direct_comparison_calculates_price_per_square_foot():
    result = direct_comparison({"sizeOfBuilding": 10_000, "directComparisonInputs": {"directComparisonMetric": "psf", "pricePerSquareFoot": 250}}, {"netOperatingIncome": 0})
    assert result["comparativeValue"] == 2_500_000


def test_direct_comparison_uses_the_same_unit_area_shown_by_the_react_model():
    result = direct_comparison({
        "sizeOfBuilding": 50_000,
        "units": [{"squareFootage": 8_000}, {"squareFootage": 7_000}],
        "directComparisonInputs": {"directComparisonMetric": "psf", "pricePerSquareFoot": 260},
    }, {"netOperatingIncome": 0})
    assert result["comparativeValue"] == 3_900_000


def test_discounted_cash_flow_returns_legacy_summary_shape():
    dcf = discounted_cash_flow({"effectiveDate": "2025-01-01", "discountedCashFlowInputs": {"projectionYears": 2, "discountRate": 10},
                                "incomeStatement": {"items": [{"name": "Rent", "yearlyAmounts": {"2025": 100_000}}]},
                                "expenseStatement": {"items": [{"name": "Repairs", "yearlyAmounts": {"2025": 20_000}}]}})
    summary = dcf["cashFlowSummary"]
    assert summary["years"] == [2025, 2026]
    assert summary["netOperatingIncome"]["amounts"]["2025"] == 80_000
    assert summary["presentValue"]["amounts"]["2026"] < 80_000


def test_calculations_accept_react_tenancy_unit_shape():
    appraisal = {
        "effectiveDate": "2026-01-01",
        "marketRents": [{"name": "Office market", "amount": 25}],
        "units": [
            {"unitNumber": "101", "squareFootage": 1_000, "tenancies": [{"name": "Harbour Tenant", "monthlyRent": 10_000}]},
            {"unitNumber": "102", "squareFootage": 2_000, "marketRent": "Office market", "shouldUseMarketRent": True,
             "tenancies": [{"name": "Vacant", "yearlyRent": 0}]},
        ],
        "stabilizedStatementInputs": {"vacancyRate": 0, "structuralAllowancePercent": 0},
        "discountedCashFlowInputs": {"projectionYears": 1},
    }
    statement = stabilized_statement(appraisal)
    dcf = discounted_cash_flow(appraisal)
    assert statement["rentalIncome"] == 170_000
    assert dcf["cashFlowSummary"]["incomes"][0]["name"] == "Harbour Tenant"
    assert dcf["cashFlowSummary"]["incomes"][1]["amounts"]["2026"] == 50_000


def test_validation_exposes_editable_field_errors():
    validation = validate_appraisal({"name": "", "address": "", "units": [{"squareFootage": -1}]})
    assert validation["valid"] is False
    assert set(validation["errorFields"]) == {"name", "address", "units.0.squareFootage"}

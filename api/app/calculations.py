"""Deterministic valuation calculations used by the local compatibility API.

The functions deliberately consume and return the legacy Mongo-shaped fields so
reviewed appraisals remain editable while individual screen models are ported.
"""
from __future__ import annotations

import math
from datetime import date
from typing import Any


def number(value: Any, default: float = 0) -> float:
    try:
        return float(value) if value is not None else default
    except (TypeError, ValueError):
        return default


def round_significant(value: float, digits: int = 3) -> float:
    return 0 if value == 0 else round(value, -int(math.floor(math.log10(abs(value)))) + digits - 1)


def unit_tenant_name(unit: dict) -> str:
    """Read both the legacy flat unit and React tenancy-list shapes."""
    if unit.get("tenantName"):
        return str(unit["tenantName"])
    tenancies = unit.get("tenancies") or []
    tenancy = tenancies[-1] if tenancies else {}
    return str(tenancy.get("name") or tenancy.get("tenantName") or "Vacant")


def unit_is_vacant(unit: dict) -> bool:
    return bool(unit.get("isVacantForStabilizedStatement") or unit.get("shouldTreatAsVacant"))


def unit_yearly_rent(appraisal: dict, unit: dict) -> float:
    """Resolve a unit's rent without losing the current screen model's fields."""
    for field in ("yearlyRent", "annualRent"):
        if unit.get(field) is not None:
            return number(unit[field])
    if unit.get("shouldUseMarketRent"):
        market_name = unit.get("marketRent")
        for market_rent in appraisal.get("marketRents") or []:
            if market_rent.get("name") == market_name:
                return number(market_rent.get("amountPSF", market_rent.get("amount"))) * number(unit.get("squareFootage"))
    tenancies = unit.get("tenancies") or []
    tenancy = tenancies[-1] if tenancies else {}
    for field in ("yearlyRent", "annualRent"):
        if tenancy.get(field) is not None:
            return number(tenancy[field])
    if tenancy.get("monthlyRent") is not None:
        return number(tenancy["monthlyRent"]) * 12
    return number(unit.get("marketRent"))


def building_size(appraisal: dict) -> float:
    """Match the React model, which derives building area from its unit rows."""
    unit_area = sum(number(unit.get("squareFootage")) for unit in appraisal.get("units") or [])
    return unit_area or number(appraisal.get("sizeOfBuilding"))


def typed_statement_items(appraisal: dict, statement: str, item_types: set[str]) -> list[dict]:
    return [item for item in (appraisal.get(statement) or {}).get("items") or []
            if item.get("incomeStatementItemType") in item_types]


def stabilized_statement(appraisal: dict) -> dict:
    inputs = appraisal.get("stabilizedStatementInputs") or {}
    units = appraisal.get("units") or []
    rental_income = sum(unit_yearly_rent(appraisal, unit) for unit in units)
    typed_income = typed_statement_items(appraisal, "incomeStatement", {"additional_income"})
    additional_rows = typed_income or list(appraisal.get("additionalIncomes", []))
    additional_income = sum(_statement_amount(item, int(str(appraisal.get("effectiveDate") or date.today().year)[:4]))
                            for item in additional_rows)
    potential_gross_income = rental_income + additional_income
    vacancy_deduction = potential_gross_income * number(inputs.get("vacancyRate"), 5) / 100
    effective_gross_income = potential_gross_income - vacancy_deduction
    expenses_mode = inputs.get("expensesMode", "income_statement")
    statement_expenses = typed_statement_items(
        appraisal, "expenseStatement", {"operating_expense", "management_expense", "taxes"}
    )
    statement_year = int(str(appraisal.get("effectiveDate") or date.today().year)[:4])
    operating_rows = [item for item in statement_expenses if item.get("incomeStatementItemType") == "operating_expense"]
    operating_expenses = (sum(_statement_amount(item, statement_year) for item in operating_rows)
                          if statement_expenses else
                          sum(number(item.get("amount") or item.get("yearlyAmount")) for item in appraisal.get("expenses", [])))
    tax_rows = [item for item in statement_expenses if item.get("incomeStatementItemType") == "taxes"]
    taxes = sum(_statement_amount(item, statement_year) for item in tax_rows) if statement_expenses else number(appraisal.get("taxes"))
    tmi_total = number(inputs.get("tmiRatePSF")) * building_size(appraisal) if expenses_mode == "tmi" else 0
    management_rows = [item for item in statement_expenses if item.get("incomeStatementItemType") == "management_expense"]
    if inputs.get("managementExpenseMode", "income_statement") == "income_statement" and statement_expenses:
        management_expenses = sum(_statement_amount(item, statement_year) for item in management_rows)
    else:
        management_expenses = effective_gross_income * number((inputs.get("managementExpenseCalculationRule") or {}).get("percentage")) / 100
    structural_allowance = 0 if inputs.get("managementExpenseMode") == "combined_structural_rule" else potential_gross_income * number(inputs.get("structuralAllowancePercent"), 2) / 100
    total_expenses = (tmi_total if expenses_mode == "tmi" else operating_expenses + taxes) + management_expenses + structural_allowance
    noi = effective_gross_income - total_expenses
    cap_rate = number(inputs.get("capitalizationRate"))
    capitalization = noi / (cap_rate / 100) if cap_rate else 0
    adjustments = {name: number(appraisal.get("valuationAdjustments", {}).get(name)) for name in ("marketRentDifferential", "freeRentRentLoss", "vacantUnitRentLoss", "vacantUnitLeasupCosts", "amortizedCapitalInvestment")}
    valuation = capitalization + sum(value for name, value in adjustments.items() if inputs.get(f"apply{name[0].upper()}{name[1:]}", False))
    valuation += sum(number(modifier.get("amount")) for modifier in inputs.get("modifiers", []))
    return {"rentalIncome": rental_income, "additionalIncome": additional_income, "potentialGrossIncome": potential_gross_income,
            "vacancyDeduction": vacancy_deduction, "effectiveGrossIncome": effective_gross_income, "operatingExpenses": operating_expenses,
            "taxes": taxes, "tmiTotal": tmi_total, "managementExpenses": management_expenses, "structuralAllowance": structural_allowance,
            "totalExpenses": total_expenses, "netOperatingIncome": noi, "capitalization": capitalization, "valuation": valuation,
            "valuationRounded": round_significant(valuation), **adjustments, "calculationErrors": {}, "calculationErrorFields": []}


def direct_comparison(appraisal: dict, statement: dict) -> dict:
    inputs = appraisal.get("directComparisonInputs") or {}
    metric = inputs.get("directComparisonMetric", "psf")
    multipliers = {"psf": ("sizeOfBuilding", "pricePerSquareFoot"), "psf_land": ("sizeOfLand", "pricePerSquareFootLand"), "per_acre_land": ("sizeOfLand", "pricePerAcreLand"), "psf_buildable_area": ("buildableArea", "pricePerSquareFootBuildableArea"), "per_buildable_unit": ("buildableUnits", "pricePerBuildableUnit"), "per_unit": (None, "pricePerUnit")}
    if metric == "noi_multiple": comparative = statement["netOperatingIncome"] * number(inputs.get("noiPSFMultiple"))
    elif metric == "psf_land": comparative = number(appraisal.get("sizeOfLand")) * 43_560 * number(inputs.get("pricePerSquareFootLand"))
    elif metric == "per_unit": comparative = len(appraisal.get("units") or []) * number(inputs.get("pricePerUnit"))
    elif metric in multipliers:
        field, price = multipliers[metric]
        quantity = building_size(appraisal) if field == "sizeOfBuilding" else number(appraisal.get(field))
        comparative = quantity * number(inputs.get(price))
    else: comparative = 0
    adjustments = {key: number(statement.get(key)) for key in ("marketRentDifferential", "freeRentRentLoss", "vacantUnitRentLoss", "vacantUnitLeasupCosts", "amortizedCapitalInvestment")}
    valuation = comparative + sum(value for name, value in adjustments.items() if inputs.get(f"apply{name[0].upper()}{name[1:]}", False)) + sum(number(modifier.get("amount")) for modifier in inputs.get("modifiers", []))
    return {"comparativeValue": comparative, "valuation": valuation, "valuationRounded": round_significant(valuation), **adjustments}


def _statement_amount(item: dict, year: int) -> float:
    amounts = item.get("yearlyAmounts") or {}
    return number(amounts.get(str(year), amounts.get(year, item.get("amount", item.get("yearlyAmount", 0)))))


def discounted_cash_flow(appraisal: dict) -> dict:
    """Build the legacy DCF summary from editable annual income/expense rows."""
    inputs = appraisal.get("discountedCashFlowInputs") or {}
    effective_date = str(appraisal.get("effectiveDate") or "")
    start_year = number(inputs.get("startYear"), 0) or (int(effective_date[:4]) if effective_date[:4].isdigit() else date.today().year)
    start_year, projection_years = int(start_year), max(1, int(number(inputs.get("projectionYears"), 10)))
    years = list(range(start_year, start_year + projection_years))
    inflation, discount_rate = number(inputs.get("inflation")) / 100, number(inputs.get("discountRate")) / 100
    income_rows = list((appraisal.get("incomeStatement") or {}).get("items") or [])
    if appraisal.get("appraisalType") == "detailed" and appraisal.get("units"):
        income_rows = [item for item in income_rows if item.get("incomeStatementItemType") == "additional_income"]
    income_rows += [{"name": unit_tenant_name(unit), "yearlyAmount": unit_yearly_rent(appraisal, unit)} for unit in appraisal.get("units", [])]
    typed_expenses = typed_statement_items(
        appraisal, "expenseStatement", {"operating_expense", "management_expense", "taxes"}
    )
    statement_expense_rows = list((appraisal.get("expenseStatement") or {}).get("items") or [])
    expense_rows = typed_expenses or statement_expense_rows or list(appraisal.get("expenses", []))

    def project(rows: list[dict], cash_flow_type: str) -> tuple[list[dict], list[dict]]:
        yearly, summary = [], []
        for item in rows:
            name, amounts = item.get("name") or cash_flow_type.title(), {}
            for offset, year in enumerate(years):
                amount = _statement_amount(item, year) * (1 + inflation) ** offset
                yearly.append({"name": name, "year": year, "relativeYear": offset, "amount": amount, "cashFlowType": cash_flow_type})
                amounts[str(year)] = amount
            summary.append({"name": name, "amounts": amounts})
        return yearly, summary

    income_cashflows, incomes = project(income_rows, "income")
    expense_cashflows, expenses = project(expense_rows, "expense")
    income_totals = {str(year): sum(row["amounts"][str(year)] for row in incomes) for year in years}
    expense_totals = {str(year): sum(row["amounts"][str(year)] for row in expenses) for year in years}
    noi = {str(year): income_totals[str(year)] - expense_totals[str(year)] for year in years}
    present_value = {str(year): noi[str(year)] / (1 + discount_rate) ** offset for offset, year in enumerate(years)}
    return {"yearlyCashFlows": income_cashflows + expense_cashflows, "cashFlowSummary": {
        "years": years, "incomes": incomes, "expenses": expenses,
        "incomeTotal": {"name": "Net Revenues", "amounts": income_totals},
        "expenseTotal": {"name": "Operating Expenses", "amounts": expense_totals},
        "netOperatingIncome": {"name": "Net Operating Income", "amounts": noi},
        "presentValue": {"name": "Present Value", "amounts": present_value},
    }}


def validate_appraisal(appraisal: dict) -> dict:
    """Compatibility validation payload consumed by the appraisal review screens."""
    errors: dict[str, str] = {}
    if not str(appraisal.get("name") or "").strip(): errors["name"] = "Appraisal name is required."
    if not str(appraisal.get("address") or "").strip(): errors["address"] = "Property address is required."
    cap_rate = number((appraisal.get("stabilizedStatementInputs") or {}).get("capitalizationRate"))
    if cap_rate < 0 or cap_rate > 100: errors["stabilizedStatementInputs.capitalizationRate"] = "Capitalization rate must be between 0 and 100."
    for index, unit in enumerate(appraisal.get("units") or []):
        if number(unit.get("squareFootage")) < 0: errors[f"units.{index}.squareFootage"] = "Unit area cannot be negative."
    units = appraisal.get("units") or []
    occupied_units = [unit for unit in units if not unit_is_vacant(unit)]
    tenant_names = [unit_tenant_name(unit).strip() for unit in occupied_units]
    has_tenant_names = bool(occupied_units) and all(name and name.lower() != "vacant" for name in tenant_names)
    has_unit_sizes = bool(units) and all(number(unit.get("squareFootage")) > 0 for unit in units)
    has_rents = bool(occupied_units) and all(unit_yearly_rent(appraisal, unit) > 0 for unit in occupied_units)
    has_lease_terms = bool(occupied_units) and all(
        any(tenancy.get("startDate") and tenancy.get("endDate") for tenancy in unit.get("tenancies") or [])
        for unit in occupied_units
    )
    expense_items = typed_statement_items(
        appraisal, "expenseStatement", {"operating_expense", "management_expense", "taxes"}
    )
    has_expenses = bool(expense_items or appraisal.get("expenses"))
    has_taxes = bool([item for item in expense_items if item.get("incomeStatementItemType") == "taxes"] or appraisal.get("taxes"))
    has_additional_income = bool(
        typed_statement_items(appraisal, "incomeStatement", {"additional_income"}) or appraisal.get("additionalIncomes")
    )
    has_amortizations = bool((appraisal.get("amortizationSchedule") or {}).get("items"))
    has_address = bool(str(appraisal.get("address") or "").strip())
    has_property_type = bool(str(appraisal.get("propertyType") or "").strip())
    has_building_size = building_size(appraisal) > 0
    has_lot_size = number(appraisal.get("sizeOfLand")) > 0
    has_zoning = bool(str(appraisal.get("zoning") or "").strip())
    return {
        "valid": not errors, "errors": errors, "errorFields": sorted(errors),
        "hasBuildingInformation": all((has_address, has_property_type, has_building_size, has_lot_size, has_zoning)),
        "hasRentRoll": all((has_tenant_names, has_unit_sizes, has_rents, has_lease_terms)),
        "hasIncomeStatement": bool((appraisal.get("incomeStatement") or {}).get("items")),
        "hasEscalations": has_rents, "hasRents": has_rents, "hasTenantNames": has_tenant_names,
        "hasUnitSizes": has_unit_sizes, "hasLeaseTerms": has_lease_terms,
        "hasFinancialInfo": all((has_expenses, has_taxes, has_additional_income, has_amortizations)),
        "hasExpenses": has_expenses, "hasTaxes": has_taxes,
        "hasAdditionalIncome": has_additional_income, "hasAmortizations": has_amortizations,
        "hasPropertyType": has_property_type, "hasBuildingSize": has_building_size,
        "hasLotSize": has_lot_size, "hasZoning": has_zoning, "hasAddress": has_address,
    }


def refresh_valuations(appraisal: dict) -> dict:
    statement = stabilized_statement(appraisal)
    return {"stabilizedStatement": statement, "directComparisonValuation": direct_comparison(appraisal, statement),
            "discountedCashFlow": discounted_cash_flow(appraisal), "validationResult": validate_appraisal(appraisal)}

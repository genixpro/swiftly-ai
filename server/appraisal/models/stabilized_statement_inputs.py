from mongoengine import *
import datetime
from appraisal.models.calculation_rule import CalculationRule


class StabilizedStatementModifier(EmbeddedDocument):
    name = StringField()
    amount = FloatField()


class StabilizedStatementInputs(EmbeddedDocument):
    # The capitalization rate for the stabilized statement
    capitalizationRate = FloatField(default=5.0)

    # The vacancy rate for the stabilized statement
    vacancyRate = FloatField(default=4.0)

    structuralAllowancePercent = FloatField(default=2.0)

    # This is the discount rate for market rent differentials
    marketRentDifferentialDiscountRate = FloatField(default=5.0)

    # This is a dictionary mapping the modifiers that are added to the final valuation
    modifiers = ListField(EmbeddedDocumentField(StabilizedStatementModifier), default=[])

    # This specifies whether expenses are taken from the income statement or calculated based on TMI rates
    expensesMode = StringField(default="income_statement", choices=["income_statement", "tmi"])

    # This specifies whether mangemgent expenses are taken from the income statement, or based on a calculation rule
    managementExpenseMode = StringField(default="rule", choices=["income_statement", "rule", "combined_structural_rule"])

    managementExpenseCalculationRule = EmbeddedDocumentField(CalculationRule, default=CalculationRule(percentage=3, field="effectiveGrossIncome"))

    # This provides the user-selected TMI rates for the expenses
    tmiRatePSF = FloatField()

    applyVacantUnitLeasingCosts = BooleanField(default=True)
    applyVacantUnitRentLoss = BooleanField(default=True)
    applyFreeRentLoss = BooleanField(default=True)
    applyAmortization = BooleanField(default=True)
    applyMarketRentDifferential = BooleanField(default=True)

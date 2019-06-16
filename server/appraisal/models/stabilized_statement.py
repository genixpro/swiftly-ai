from mongoengine import *
import datetime
from appraisal.models.extraction_reference import ExtractionReference


class StabilizedStatement(EmbeddedDocument):
    meta = {'strict': False}

    rentalIncome = FloatField()

    additionalIncome = FloatField()

    recoverableIncome = FloatField()

    potentialGrossIncome = FloatField()

    managementRecovery = FloatField()

    operatingExpenseRecovery = FloatField()

    taxRecovery = FloatField()

    vacancyDeduction = FloatField()

    effectiveGrossIncome = FloatField()

    operatingExpenses = FloatField()

    tmiTotal = FloatField()

    taxes = FloatField()

    managementExpenses = FloatField()

    structuralAllowance = FloatField()

    totalExpenses = FloatField()

    netOperatingIncome = FloatField()

    capitalization = FloatField()

    marketRentDifferential = FloatField()

    freeRentRentLoss = FloatField()

    vacantUnitRentLoss = FloatField()

    vacantUnitLeasupCosts = FloatField()

    amortizedCapitalInvestment = FloatField()

    valuation = FloatField()

    valuationRounded = FloatField()

    # Indicates whether there was a recursive calculation error when doing this appraisal, and if so, what field was it on.
    calculationErrorFields = ListField(StringField())

    # A Dict mapping field name to the calculation error message
    calculationErrors = DictField(StringField())


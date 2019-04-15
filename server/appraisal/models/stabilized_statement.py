from mongoengine import *
import datetime
from .extraction_reference import ExtractionReference


class StabilizedStatement(EmbeddedDocument):
    rentalIncome = FloatField()

    additionalIncome = FloatField()

    recoverableIncome = FloatField()

    potentialGrossIncome = FloatField()

    grossIncome = FloatField()

    vacancyDeduction = FloatField()

    effectiveGrossIncome = FloatField()

    operatingExpenses = FloatField()

    tmiTotal = FloatField()

    taxes = FloatField()

    managementExpenses = FloatField()

    structuralAllowance = FloatField()

    totalExpenses = FloatField()

    netOperatingIncome = FloatField()

    netOperatingIncomePSF = FloatField()

    capitalization = FloatField()

    marketRentDifferential = FloatField()

    freeRentDifferential = FloatField()

    vacantUnitDifferential = FloatField()

    valuation = FloatField()

    valuationRounded = FloatField()


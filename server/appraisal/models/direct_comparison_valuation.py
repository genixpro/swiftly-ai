from mongoengine import *
import datetime
from appraisal.models.extraction_reference import ExtractionReference



class DirectComparisonValuation(EmbeddedDocument):
    meta = {'strict': False}

    comparativeValue = FloatField()

    marketRentDifferential = FloatField()

    freeRentRentLoss = FloatField()

    vacantUnitLeasupCosts = FloatField()

    vacantUnitRentLoss = FloatField()

    amortizedCapitalInvestment = FloatField()

    valuation = FloatField()

    valuationRounded = FloatField()


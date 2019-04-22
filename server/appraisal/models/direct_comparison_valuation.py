from mongoengine import *
import datetime
from appraisal.models.extraction_reference import ExtractionReference



class DirectComparisonValuation(EmbeddedDocument):
    comparativeValue = FloatField()

    marketRentDifferential = FloatField()

    freeRentDifferential = FloatField()

    vacantUnitDifferential = FloatField()

    amortizationDifferential = FloatField()

    valuation = FloatField()

    valuationRounded = FloatField()


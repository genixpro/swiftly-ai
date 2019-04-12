from mongoengine import *
import datetime
from .extraction_reference import ExtractionReference



class DirectComparisonValuation(EmbeddedDocument):
    comparativeValue = FloatField()

    valuation = FloatField()

    valuationRounded = FloatField()


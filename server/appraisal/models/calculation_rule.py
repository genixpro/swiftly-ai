
from mongoengine import *
import datetime
from appraisal.models.extraction_reference import ExtractionReference


class CalculationRule(EmbeddedDocument):
    percentage = FloatField()

    field = StringField()

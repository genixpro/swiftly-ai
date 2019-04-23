
from mongoengine import *
import datetime
from appraisal.models.extraction_reference import ExtractionReference


class CalculationRule(EmbeddedDocument):
    meta = {'strict': False}

    percentage = FloatField()

    field = StringField()

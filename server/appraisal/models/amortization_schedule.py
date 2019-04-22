from mongoengine import *
import datetime
from appraisal.models.extraction_reference import ExtractionReference
from appraisal.models.date_field import ConvertingDateField

class AmortizationItem(EmbeddedDocument):
    meta = {'strict': False}

    # The name of the amortization item
    name = StringField()

    # The amount being amortized
    amount = FloatField()

    # Interest on pieces being amortized
    interest = FloatField()

    # Discount rate on amortization
    discountRate = FloatField()

    # Start date for amortization
    startDate = ConvertingDateField()

    # Period in months
    periodMonths = FloatField()



class AmortizationSchedule(EmbeddedDocument):
    items = ListField(EmbeddedDocumentField(AmortizationItem))

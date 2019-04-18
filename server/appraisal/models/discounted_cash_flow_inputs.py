from mongoengine import *
import datetime


class DiscountedCashFlowInputs(EmbeddedDocument):
    meta = {'strict': False}

    # The inflation rate that will be applied to this model
    inflation = FloatField(default=2.0)

    # The discount rate that will be applied to this model
    discountRate = FloatField(default=5.0)


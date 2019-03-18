from mongoengine import *
import datetime


class DiscountedCashFlowInputs(EmbeddedDocument):
    # The inflation rate that will be applied to this model
    inflation = FloatField(default=2.0)

    # The discount rate that will be applied to this model
    discountRate = FloatField(default=5.0)

    # The cost of making a new lease
    leasingCommission = FloatField(default=1000)

    # The cost of tenant inducements for new tenants
    tenantInducements = FloatField(default=1000)

    # This is the period of time, in months, that it takes to find a new tenant
    renewalPeriod = IntField(default=3)



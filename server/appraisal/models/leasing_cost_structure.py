from mongoengine import *
import datetime


class LeasingCostStructure(EmbeddedDocument):
    meta = {'strict': False}

    # The name of this leasing cost structure
    name = StringField()

    # The cost of making a new lease
    leasingCommissionPSF = FloatField(default=0.5)

    # The cost of tenant inducements for new tenants
    tenantInducementsPSF = FloatField(default=1.5)

    # This is the period of time, in months, that it takes to find a new tenant
    renewalPeriod = IntField(default=3)

    # This is the period of time, in months, that a typical tenant will lease the space for
    leasingPeriod = IntField(default=60)



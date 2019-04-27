from mongoengine import *
import datetime


class LeasingCostStructure(EmbeddedDocument):
    meta = {'strict': False}

    # The name of this leasing cost structure
    name = StringField()

    # The cost of making a new lease, on a PSF basis
    leasingCommissionPSF = FloatField(default=0.5)

    # The cost of making a new lease, on a percentage of rent basis
    leasingCommissionPercentYearOne = FloatField(default=2)

    # The cost of making a new lease, on a percentage of rent basis
    leasingCommissionPercentRemainingYears = FloatField(default=2)

    # Whether leasing commission is given as a percentage of rent or a PSF rate
    leasingCommissionMode = StringField(default='psf', choices=['percent_of_rent', 'psf'])

    # The cost of tenant inducements for new tenants
    tenantInducementsPSF = FloatField(default=1.5)

    # This is the period of time, in months, that it takes to find a new tenant
    renewalPeriod = IntField(default=3)

    # This is the period of time, in months, that a typical tenant will lease the space for
    leasingPeriod = IntField(default=60)



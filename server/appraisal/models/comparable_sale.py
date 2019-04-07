from mongoengine import *
import datetime
from .unit import Unit
from .date_field import ConvertingDateField

class ComparableSale(Document):
    meta = {'collection': 'comparables', 'strict': False}

    # The name of the comparable
    name = StringField()

    # The address of the comparable. This is the full address, including city and region in a single string
    address = StringField()

    # This provides the GPS coordinates of the comparable
    location = PointField()

    # The description of the comparable
    description = StringField()

    # The type of property, as an enumeration.
    propertyType = StringField()

    # The net operating income of the comparable
    netOperatingIncome = FloatField()

    # The capitalization rate of the comparable
    capitalizationRate = FloatField()

    # The sale price of the comparable
    salePrice = FloatField()

    # The square footage of building
    sizeSquareFootage = FloatField()

    # The occupancy rate of the building
    occupancyPercentage = FloatField()

    # The purchaser
    purchaser = StringField()

    vendor = StringField()

    tenants = StringField()

    additionalInfo = StringField()

    constructionDate = ConvertingDateField(sparse=True, default=None, null=True)

    siteArea = FloatField()

    parking = StringField()

    # The TMI (taxes maintenance insurance) for the property
    taxesMaintenanceInsurancePSF = FloatField()

    # The vacancy rate for the building (between 0 and 1)
    vacancyRate = FloatField()

    # The date that the comparable was sold
    saleDate = ConvertingDateField(sparse=True, default=None, null=True)

    # A list of tags associated with this comparable lease
    propertyTags = ListField(StringField())




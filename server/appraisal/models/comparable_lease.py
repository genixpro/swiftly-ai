from mongoengine import *
import datetime
from .unit import Unit
from .date_field import ConvertingDateField


class ComparableLease(Document):
    meta = {'collection': 'comparable_leases', 'strict': False}

    # The address of the comparable. This is the full address, including city and region in a single string
    address = StringField()

    # This provides the GPS coordinates of the comparable
    location = PointField()

    # The type of property, as an enumeration.
    propertyType = StringField()

    # The name of the tenant
    tenantName = StringField()

    # The size of the unit in square-feet
    sizeOfUnit = FloatField()

    # The yearly rent for the unit
    yearlyRent = FloatField()

    # Tenant inducements in plain text
    tenantInducements = StringField()

    # Free rent in plain text
    freeRent = StringField()

    # Escalations described in plain text
    escalations = StringField()

    # The description of the comparable
    description = StringField()

    # Floor number
    floorNumber = IntField()

    # Retail type
    retailLocationType = StringField(choices=["street_front", "upper_level", ""], default="street_front")

    # The date of the lease
    leaseDate = ConvertingDateField()

    # This specifies the rent-type. This can be either "NET" or "GROSS"
    rentType = StringField(choices=["net", "gross"], default="net")

    # A list of tags associated with this comparable lease
    propertyTags = ListField(StringField())

    # The TMI (taxes maintenance insurance) for the property
    taxesMaintenanceInsurance = FloatField()

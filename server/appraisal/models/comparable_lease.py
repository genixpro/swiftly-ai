from mongoengine import *
import datetime
from appraisal.models.unit import Unit
from appraisal.models.date_field import ConvertingDateField


class RentEscalation(EmbeddedDocument):
    meta = {'strict': False}

    startYear = FloatField()

    endYear = FloatField()

    yearlyRent = FloatField()


class ComparableLease(Document):
    meta = {'collection': 'comparable_leases', 'strict': False}

    # The owner of this comparable lease
    owner = StringField()

    # The address of the comparable. This is the full address, including city and region in a single string
    address = StringField()

    # This provides the GPS coordinates of the comparable
    location = PointField()

    imageUrl = StringField()

    # The type of property, as an enumeration.
    propertyType = StringField()

    # The name of the tenant
    tenantName = StringField()

    # The size of the unit in square-feet
    sizeOfUnit = FloatField()

    # The rent escalations for this lease
    rentEscalations = ListField(EmbeddedDocumentField(RentEscalation))

    # Tenant inducements in plain text
    tenantInducements = StringField()

    # Free rent in plain text
    freeRent = StringField()

    # The description of the comparable
    description = StringField()

    # Floor number
    floorNumber = IntField()

    # Retail type
    retailLocationType = StringField(choices=["street_front", "upper_level", ""], default="street_front")

    # Clear Ceiling Height
    clearCeilingHeight = FloatField()

    # Shipping Doors
    shippingDoors = FloatField()

    # The date of the lease
    leaseDate = ConvertingDateField()

    # This specifies the rent-type. This can be either "NET" or "GROSS"
    rentType = StringField(choices=["net", "gross"], default="net")

    # A list of tags associated with this comparable lease
    propertyTags = ListField(StringField())

    # The TMI (taxes maintenance insurance) for the property
    taxesMaintenanceInsurance = FloatField()

    # Shipping Doors
    remarks = StringField()

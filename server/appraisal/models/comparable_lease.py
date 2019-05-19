from mongoengine import *
import datetime
from appraisal.models.unit import Unit
from appraisal.models.date_field import ConvertingDateField
from ..migrations import registerMigration
import re

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

    # Number of months of free rent
    freeRentMonths = IntField()

    # The type of free rent - net / gross
    freeRentType = StringField(choices=["net", "gross", "", None], default="", null=True)

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

    tenancyType = StringField(choices=['single_tenant', 'multi_tenant', 'vacant'])

    version = IntField(default=1)


@registerMigration(ComparableLease, 1)
def migration_001_update_free_rent(lease):
    if lease.freeRent:
        freeRentNumbers = re.sub("[^0-9.]*", "", lease.freeRent)

        if freeRentNumbers:
            lease.freeRentMonths = int(float(freeRentNumbers))
        else:
            lease.freeRentMonths = None

        if 'net' in lease.freeRent.lower():
            lease.freeRentType = "net"
        elif 'gross' in lease.freeRent.lower():
            lease.freeRentType = "gross"

from mongoengine import *
import datetime
from appraisal.models.unit import Unit
from appraisal.models.date_field import ConvertingDateField
from ..migrations import registerMigration
import re
from ..migrations import registerMigration
from dateutil import relativedelta

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

    imageUrl = StringField() # Deprecated

    imageUrls = ListField(StringField())

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

    # Free rent in plain text. DEPRECATED
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

    # Shipping Doors. DEPRECATED
    shippingDoors = FloatField()

    # Shipping Doors - Truck Level
    shippingDoorsTruckLevel = FloatField()

    # Shipping Doors - Double Man
    shippingDoorsDoubleMan = FloatField()

    # Shipping Doors - Drive In
    shippingDoorsDriveIn = FloatField()

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

    tenancyType = StringField(choices=['single_tenant', 'multi_tenant', 'vacant', ""], null=True)

    version = IntField(default=2)


    def fillDataFromAppraisal(self, appraisal, unit):
        self.address = appraisal.address
        self.location = appraisal.location
        self.propertyType = appraisal.propertyType
        self.tenantName = unit.currentTenancy.name
        self.sizeOfUnit = unit.squareFootage
        self.rentEscalations = [
            RentEscalation(startYear=tenancy.startDate.year - unit.currentTenancy.startDate.year + 1, endYear=tenancy.endDate.year - unit.currentTenancy.endDate.year + 1, yearlyRent=tenancy.yearlyRent / unit.squareFootage)
            for tenancy in unit.tenancies
            if tenancy.startDate and tenancy.startDate >= unit.currentTenancy.startDate and tenancy.yearlyRent > 0
        ]

        if unit.leasingCostStructure:
            structure = appraisal.getLeasingCostStructureWithName(unit.leasingCostStructure)
            self.tenantInducements = f"${structure.tenantInducementsPSF:.2} TI/psf"
        else:
            self.tenantInducements = ""

        for tenancy in unit.tenancies:
            if tenancy.startDate and tenancy.startDate >= unit.currentTenancy.startDate:
                if tenancy.freeRentMonths:
                    self.freeRentMonths = tenancy.freeRentMonths
                    self.freeRentType = tenancy.freeRentType
                    break
                elif tenancy.yearlyRent == 0 and tenancy.endDate:
                    months = relativedelta(tenancy.startDate, tenancy.endDate).months

                    self.freeRentMonths = months
                    self.freeRentType = tenancy.rentType
                    break

        self.floorNumber = unit.floorNumber
        self.leaseDate = unit.currentTenancy.startDate
        self.rentType = unit.currentTenancy.rentType
        self.propertyTags = appraisal.propertyTags
        self.taxesMaintenanceInsurance = (appraisal.stabilizedStatement.taxes + appraisal.stabilizedStatement.operatingExpenses) / appraisal.sizeOfBuilding
        if len(appraisal.units) > 1:
            self.tenancyType = "multi_tenant"
        elif len(appraisal.units) == 1:
            self.tenancyType = "single_tenant"


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

@registerMigration(ComparableLease, 2)
def migration_002_update_image_urls(comparable):
    if comparable.imageUrl:
        if comparable.imageUrl not in comparable.imageUrls:
            comparable.imageUrls.append(comparable.imageUrl)


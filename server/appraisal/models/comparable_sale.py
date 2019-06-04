from mongoengine import *
import datetime
from appraisal.models.unit import Unit
from appraisal.models.date_field import ConvertingDateField
from ..migrations import registerMigration

class ComparableSale(Document):
    meta = {'collection': 'comparables', 'strict': False}

    # The owner of this comparable sale
    owner = StringField()

    # The address of the comparable. This is the full address, including city and region in a single string
    address = StringField()

    # This provides the GPS coordinates of the comparable
    location = PointField()

    imageUrl = StringField() # Deprecated

    # This provides the urls for images of this comp
    imageUrls = ListField(StringField())

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
    occupancyRate = FloatField()

    # The purchaser
    purchaser = StringField()

    vendor = StringField()

    tenants = StringField()

    additionalInfo = StringField()

    constructionDate = StringField()

    siteArea = FloatField()

    parking = StringField()

    clearCeilingHeight = FloatField()

    # Old shipping doors. DEPRECATED.
    shippingDoors = StringField()

    # Shipping Doors - Truck Level
    shippingDoorsTruckLevel = FloatField()

    # Shipping Doors - Double Man
    shippingDoorsDoubleMan = FloatField()

    # Shipping Doors - Drive In
    shippingDoorsDriveIn = FloatField()

    siteCoverage = FloatField()

    # The PPS for the building
    pricePerSquareFoot = FloatField()

    # The PPS for the building
    floors = StringField()

    # The date that the comparable was sold
    saleDate = ConvertingDateField(sparse=True, default=None, null=True)

    # A list of tags associated with this comparable lease
    propertyTags = ListField(StringField())

    # For land comparables, this gives you the zoning information for the land
    zoning = StringField()

    # For land comparables, these are development proposals attached to the site
    developmentProposals = StringField()

    # Size of land, in square feet
    sizeOfLandSqft = FloatField()

    # Size of land, in acres
    sizeOfLandAcres = FloatField()

    # Size of buildable area, in square feet
    sizeOfBuildableAreaSqft = FloatField()

    # Size of buildable area, in acres
    sizeOfBuildableAreaAcres = FloatField()

    # Other land comp stuff
    pricePerSquareFootLand = FloatField()

    pricePerAcreLand = FloatField()

    pricePerSquareFootBuildableArea = FloatField()

    pricePerAcreBuildableArea = FloatField()

    pricePerBuildableUnit = FloatField()

    floorSpaceIndex = FloatField()

    # The percentage of the building that is finished office space, for industrial comps
    finishedOfficePercent = FloatField()

    buildableUnits = FloatField()

    netOperatingIncomePSF = FloatField()

    noiPSFMultiple = FloatField()

    numberOfUnits = FloatField()

    averageMonthlyRentPerUnit = FloatField()

    noiPerUnit = FloatField()
    noiPerBedroom = FloatField()

    pricePerUnit = FloatField()
    pricePerBedroom = FloatField()
    numberOfBachelors = FloatField()
    numberOfOneBedrooms = FloatField()
    numberOfTwoBedrooms = FloatField()
    numberOfThreePlusBedrooms = FloatField()
    totalBedrooms = FloatField()

    tenancyType = StringField(choices=['single_tenant', 'multi_tenant', 'vacant', ""], null=True)

    version = IntField(default=1)



@registerMigration(ComparableSale, 1)
def migration_001_update_image_urls(comparable):
    if comparable.imageUrl:
        if comparable.imageUrl not in comparable.imageUrls:
            comparable.imageUrls.append(comparable.imageUrl)

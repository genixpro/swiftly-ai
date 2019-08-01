from mongoengine import *
import datetime
from appraisal.models.unit import Unit
from appraisal.models.date_field import ConvertingDateField
from ..migrations import registerMigration
import scipy.stats
import numpy
import bson
from .custom_id_field import CustomIDField
import json as json, bson
from .custom_id_field import generateNewUUID
from pprint import pprint

class ComparableSale(Document):
    meta = {
        'collection': 'comparables',
        'strict': False,
        'indexes': [
            ('owner', 'propertyType'),
            ('owner', 'saleDate'),
            ('owner', 'salePrice'),
            ('owner', 'sizeSquareFootage'),
            ('owner', 'propertyTags'),
            ['owner', ("location", "2dsphere")],
            'version'
        ]
    }

    id = CustomIDField()

    # The owner of this comparable sale
    owner = StringField()

    # The address of the comparable. This is the full address, including city and region in a single string
    address = StringField()

    # This provides the GPS coordinates of the comparable
    location = PointField()

    imageUrl = StringField() # Deprecated

    # This provides the urls for images of this comp
    imageUrls = ListField(StringField())

    # Captions for the images of this building.
    captions = ListField(StringField(), default=[])

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

    useStabilizedNoi = BooleanField(default=False)
    stabilizedNoiVacancyRate = FloatField()
    stabilizedNoiStructuralAllowance = FloatField()
    stabilizedNoiCustomDeduction = FloatField()
    stabilizedNoiCustomName = StringField(default="Custom")

    isPortfolioCompilation = BooleanField(default=False)
    isPartOfPortfolio = BooleanField(default=False)
    allowSubCompSearch = BooleanField(default=True)

    portfolioCompilationLinkId = StringField()
    portfolioLinkedComps = ListField(StringField())

    vendorTakebackPercent = FloatField()

    version = IntField(default=3)


    def updatePortfolioComparable(self, subComps):
        # subComps = list(ComparableSale.objects(id__in=self.portfolioLinkedComps))

        addresses = [comp.address for comp in subComps if comp.address]
        self.address = ", ".join(set(addresses)) if len(addresses) else None

        locations = [comp.location for comp in subComps if comp.location]
        self.location = locations[0] if len(locations) else None

        self.imageUrls = [image for comp in subComps for image in comp.imageUrls]

        propertyTypes = [comp.propertyType for comp in subComps if comp.propertyType]
        self.propertyType = str(scipy.stats.mode(propertyTypes)[0][0]) if len(propertyTypes) else None

        netOperatingIncomes = [comp.netOperatingIncome for comp in subComps if comp.netOperatingIncome]
        self.netOperatingIncome = float(numpy.sum(netOperatingIncomes)) if len(netOperatingIncomes) else None

        salePrices = [comp.salePrice for comp in subComps if comp.salePrice]
        self.salePrice = float(numpy.sum(salePrices)) if len(salePrices) else None

        if self.netOperatingIncome and self.salePrice:
            self.capitalizationRate = self.netOperatingIncome / self.salePrice

        sizeSquareFootages = [comp.sizeSquareFootage for comp in subComps if comp.sizeSquareFootage]
        self.sizeSquareFootage = float(numpy.sum(sizeSquareFootages)) if len(sizeSquareFootages) else None

        occupancyRates = [comp.occupancyRate for comp in subComps if comp.occupancyRate]
        self.occupancyRate = float(numpy.mean(occupancyRates)) if len(occupancyRates) else None

        purchasers = [comp.purchaser for comp in subComps if comp.purchaser]
        self.purchaser = ", ".join(set(purchasers)) if len(purchasers) else None

        vendors = [comp.vendor for comp in subComps if comp.vendor]
        self.vendor = ", ".join(set(vendors)) if len(vendors) else None

        tenants = [comp.tenants for comp in subComps if comp.tenants]
        self.tenants = ", ".join(set(tenants)) if len(tenants) else None

        siteAreas = [comp.siteArea for comp in subComps if comp.siteArea]
        self.siteArea = float(numpy.sum(siteAreas)) if len(siteAreas) else None

        clearCeilingHeights = [comp.clearCeilingHeight for comp in subComps if comp.clearCeilingHeight]
        self.clearCeilingHeight = float(numpy.max(clearCeilingHeights)) if len(clearCeilingHeights) else None

        shippingDoorsTruckLevels = [comp.shippingDoorsTruckLevel for comp in subComps if comp.shippingDoorsTruckLevel]
        self.shippingDoorsTruckLevel = float(numpy.sum(shippingDoorsTruckLevels)) if len(shippingDoorsTruckLevels) else None

        shippingDoorsDoubleMans = [comp.shippingDoorsDoubleMan for comp in subComps if comp.shippingDoorsDoubleMan]
        self.shippingDoorsDoubleMan = float(numpy.sum(shippingDoorsDoubleMans)) if len(shippingDoorsDoubleMans) else None

        shippingDoorsDriveIns = [comp.shippingDoorsDriveIn for comp in subComps if comp.shippingDoorsDriveIn]
        self.shippingDoorsDriveIn = float(numpy.sum(shippingDoorsDriveIns)) if len(shippingDoorsDriveIns) else None

        coveredAreas = [comp.siteCoverage * comp.sizeOfLandSqft / 100 for comp in subComps if comp.siteCoverage and comp.sizeOfLandSqft]
        totalCovered = float(numpy.sum(coveredAreas)) if len(coveredAreas) else None

        landSizesWithCoverage = [comp.sizeOfLandSqft for comp in subComps if comp.siteCoverage and comp.sizeOfLandSqft]
        totalCoverable = float(numpy.sum(landSizesWithCoverage)) if len(landSizesWithCoverage) else None
        if totalCovered is not None and totalCoverable is not None:
            self.siteCoverage = float(totalCovered * 100 / totalCoverable)
        else:
            self.siteCoverage = None

        if self.salePrice and self.sizeSquareFootage:
            self.pricePerSquareFoot = self.salePrice / self.sizeSquareFootage

        saleDates = [comp.saleDate for comp in subComps if comp.saleDate]
        self.saleDate = scipy.stats.mode(saleDates) if len(saleDates) else None

        self.propertyTags = [tag for comp in subComps for tag in comp.propertyTags]

        sizeOfLandSqfts = [comp.sizeOfLandSqft for comp in subComps if comp.sizeOfLandSqft]
        self.sizeOfLandSqft = float(numpy.sum(sizeOfLandSqfts)) if len(sizeOfLandSqfts) else None

        sizeOfLandAcres = [comp.sizeOfLandAcres for comp in subComps if comp.sizeOfLandAcres]
        self.sizeOfLandAcres = float(numpy.sum(sizeOfLandAcres)) if len(sizeOfLandAcres) else None

        sizeOfBuildableAreaSqfts = [comp.sizeOfBuildableAreaSqft for comp in subComps if comp.sizeOfBuildableAreaSqft]
        self.sizeOfBuildableAreaSqft = float(numpy.sum(sizeOfBuildableAreaSqfts)) if len(sizeOfBuildableAreaSqfts) else None

        sizeOfBuildableAreaAcres = [comp.sizeOfBuildableAreaAcres for comp in subComps if comp.sizeOfBuildableAreaAcres]
        self.sizeOfBuildableAreaAcres = float(numpy.sum(sizeOfBuildableAreaAcres)) if len(sizeOfBuildableAreaAcres) else None

        if self.salePrice and self.sizeOfLandSqft:
            self.pricePerSquareFootLand = self.salePrice / self.sizeOfLandSqft
        else:
            self.pricePerSquareFootLand = None

        if self.salePrice and self.sizeOfLandAcres:
            self.pricePerAcreLand = self.salePrice / self.sizeOfLandAcres
        else:
            self.pricePerAcreLand = None

        if self.salePrice and self.sizeOfBuildableAreaSqft:
            self.pricePerSquareFootBuildableArea = self.salePrice / self.sizeOfBuildableAreaSqft
        else:
            self.pricePerSquareFootBuildableArea = None

        if self.salePrice and self.sizeOfBuildableAreaAcres:
            self.pricePerAcreBuildableArea = self.salePrice / self.sizeOfBuildableAreaAcres
        else:
            self.pricePerAcreBuildableArea = None

        buildableUnits = [comp.buildableUnits for comp in subComps if comp.buildableUnits]
        self.buildableUnits = float(numpy.sum(buildableUnits)) if len(buildableUnits) else None

        if self.salePrice and self.buildableUnits:
            self.pricePerBuildableUnit = self.salePrice / self.buildableUnits
        else:
            self.pricePerBuildableUnit = None

        if self.sizeOfBuildableAreaSqft and self.sizeOfLandSqft:
            self.floorSpaceIndex = self.sizeOfBuildableAreaSqft / self.sizeOfLandSqft
        else:
            self.floorSpaceIndex = None

        finishedOfficePercent = [comp.finishedOfficePercent for comp in subComps if comp.finishedOfficePercent]
        self.finishedOfficePercent = float(numpy.mean(finishedOfficePercent)) if len(finishedOfficePercent) else None

        if self.netOperatingIncome and self.sizeSquareFootage:
            self.netOperatingIncomePSF = self.netOperatingIncome / self.sizeSquareFootage
        else:
            self.netOperatingIncomePSF = None

        numberOfUnits = [comp.numberOfUnits for comp in subComps if comp.numberOfUnits]
        self.numberOfUnits = float(numpy.sum(numberOfUnits)) if len(numberOfUnits) else None

        totalRents = [comp.numberOfUnits * comp.averageMonthlyRentPerUnit for comp in subComps if comp.numberOfUnits and comp.averageMonthlyRentPerUnit]

        totalAverageRent = float(numpy.sum(totalRents)) if len(totalRents) else None
        if totalAverageRent is not None:
            unitCountsWithRent = [comp.numberOfUnits for comp in subComps if comp.numberOfUnits and comp.averageMonthlyRentPerUnit]
            self.averageMonthlyRentPerUnit = totalAverageRent / float(numpy.sum(unitCountsWithRent))
        else:
            self.averageMonthlyRentPerUnit = None

        if self.numberOfUnits and self.netOperatingIncome:
            self.noiPerUnit = self.netOperatingIncome / self.numberOfUnits
        else:
            self.averageMonthlyRentPerUnit = None

        numberOfBachelors = [comp.numberOfBachelors for comp in subComps if comp.numberOfBachelors]
        self.numberOfBachelors = float(numpy.sum(numberOfBachelors)) if len(numberOfBachelors) else None

        numberOfOneBedrooms = [comp.numberOfOneBedrooms for comp in subComps if comp.numberOfOneBedrooms]
        self.numberOfOneBedrooms = float(numpy.sum(numberOfOneBedrooms)) if len(numberOfOneBedrooms) else None

        numberOfTwoBedrooms = [comp.numberOfTwoBedrooms for comp in subComps if comp.numberOfTwoBedrooms]
        self.numberOfTwoBedrooms = float(numpy.sum(numberOfTwoBedrooms)) if len(numberOfTwoBedrooms) else None

        numberOfThreePlusBedrooms = [comp.numberOfThreePlusBedrooms for comp in subComps if comp.numberOfThreePlusBedrooms]
        self.numberOfThreePlusBedrooms = float(numpy.sum(numberOfThreePlusBedrooms)) if len(numberOfThreePlusBedrooms) else None

        totalBedrooms = [comp.totalBedrooms for comp in subComps if comp.totalBedrooms]
        self.totalBedrooms = float(numpy.sum(totalBedrooms)) if len(totalBedrooms) else None

        if self.totalBedrooms and self.netOperatingIncome:
            self.noiPerBedroom = self.netOperatingIncome / self.totalBedrooms
        else:
            self.noiPerBedroom = None

        self.tenancyType = "multi_tenant"

        self.isPortfolioCompilation = True
        self.isPartOfPortfolio = False



@registerMigration(ComparableSale, 1)
def migration_001_update_image_urls(comparable):
    # We have to fix bad data in the db prior to running this migration
    try:
        if comparable.siteArea is not None:
            comparable.siteArea = float(comparable.siteArea)
    except ValueError:
        comparable.siteArea = None

    if comparable.imageUrl:
        if comparable.imageUrl not in comparable.imageUrls:
            comparable.imageUrls.append(comparable.imageUrl)



@registerMigration(ComparableSale, 2)
def migration_002_allow_sub_comp_search(comparable):
   comparable.allowSubCompSearch = True


@registerMigration(ComparableSale, 5)
def migration_003_004_005_update_comp_sale_object_id(object):
    data = json.loads(object.to_json())
    if len(str(object.id)) == 24:
        del data['_id']
        data['id'] = str(object.id)

        ComparableSale.objects(id=bson.ObjectId(object.id)).delete()

        newObject = ComparableSale(**data)
        return newObject


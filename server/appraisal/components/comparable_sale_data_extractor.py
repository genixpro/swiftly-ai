from appraisal.components.data_extractor import DataExtractor
from appraisal.models.unit import Unit, Tenancy
import dateparser
import re
from appraisal.models.comparable_sale import ComparableSale
from appraisal.models.zone import Zone


class ComparableSaleDataExtractor(DataExtractor):
    """ This class is for extracting comparable sale data from a document. """

    def extractComparable(self, words):
        comp = ComparableSale()

        tokens = []

        for word in words:
            if word.classification != "null":
                if len(tokens) > 0 and tokens[-1][0].classification == word.classification and tokens[-1][0].lineNumber == word.lineNumber:
                    tokens[-1].append(word)
                else:
                    tokens.append([word])

        for token in tokens:
            classification = token[0].classification
            text = " ".join(word.word for word in token)

            if classification == "PROPERTY_TYPE":
                if 'industrial' in text.lower():
                    comp.propertyType = 'industrial'
                elif 'office' in text.lower():
                    comp.propertyType = 'office'
                elif 'land' in text.lower():
                    comp.propertyType = 'land'
                elif 'retail' in text.lower():
                    comp.propertyType = 'retail'
                elif 'residential' in text.lower():
                    comp.propertyType = 'residential'
            elif classification == 'SUB_TYPE':
                comp.propertyTags.append(text)
            elif classification == 'TENANTS':
                comp.tenants = text
            elif classification == 'PARKING':
                comp.parking = text
            elif classification == 'ZONING':
                zone = Zone()
                zone.zoneName = text
                zone.save()
                comp.zoning = str(zone.id)
            elif classification == 'OCCUPANCY_RATE':
                comp.occupancyRate = self.cleanAmount(text)
            elif classification == 'VACANCY_RATE':
                comp.occupancyRate = 100 - self.cleanAmount(text)
            elif classification == 'SINGLE_TENANT':
                comp.tenancyType = "single_tenant"
            elif classification == 'MULTI_TENANT':
                comp.tenancyType = "multi_tenant"
            elif classification == 'SITE_AREA':
                if 'a' in text:
                    comp.siteArea = self.cleanAmount(text)
                elif 'f' in text:
                    comp.siteArea = self.cleanAmount(text) / 43560
                else:
                    comp.siteArea = self.cleanAmount(text)
            elif classification == 'SITE_COVERAGE':
                comp.siteCoverage = self.cleanAmount(text)
            elif classification == 'SIZE_OF_LAND_SQFT':
                comp.sizeOfLandSqft = self.cleanAmount(text)
            elif classification == 'SIZE_OF_LAND_ACRES':
                comp.sizeOfLandAcres = self.cleanAmount(text)
            elif classification == 'SITE_FRONTAGE':
                pass # HANDLE THIS LATER
            elif classification == 'BUILDING_NAME':
                pass # HANDLE THIS LATER
            elif classification == 'BUILDING_ADDRESS':
                if comp.address is None:
                    comp.address = ""

                comp.address += text + " "
            elif classification == 'BUILDING_SIZE':
                comp.sizeSquareFootage = self.cleanAmount(text)
            elif classification == 'CONSTRUCTION_DATE':
                comp.constructionDate = text
            elif classification == 'FLOORS':
                comp.floors = self.cleanAmount(text)
            elif classification == 'NUMBER_OF_UNITS':
                comp.floors = self.cleanAmount(text)
            elif classification == 'ADDITIONAL_INFO':
                if comp.additionalInfo is None:
                    comp.additionalInfo = ""
                comp.additionalInfo += text + " "
            elif classification == 'CAPITALIZATION_RATE':
                comp.capitalizationRate = self.cleanAmount(text)
            elif classification == 'NET_OPERATING_INCOME':
                comp.netOperatingIncome = self.cleanAmount(text)
            elif classification == 'PURCHASER':
                comp.purchaser = text
            elif classification == 'VENDOR':
                comp.vendor = text
            elif classification == 'SALE_DATE':
                comp.saleDate = dateparser.parse(text)
            elif classification == 'SALE_PRICE':
                comp.salePrice = self.cleanAmount(text)
            elif classification == 'PURCHASE_INTEREST_PERCENTAGE':
                pass
            elif classification == 'PORTFOLIO_OTHER_BUILDING_ADDRESS':
                pass
            elif classification == 'PORTFOLIO_OTHER_BUILDING_NAME':
                pass
            elif classification == 'PORTFOLIO_OTHER_BUILDING_PRICE':
                pass
            elif classification == 'PORTFOLIO_OTHER_BUILDING_SQUARE_FOOTAGE':
                pass
            elif classification == 'COMPLEX_BUILDING_ADDRESS':
                pass
            elif classification == 'COMPLEX_BUILDING_FLOORS':
                pass
            elif classification == 'COMPLEX_BUILDING_SQUARE_FOOTAGE':
                pass
            elif classification == 'COMPLEX_BUILDING_CONSTRUCTION_DATE':
                pass
            elif classification == 'PRICE_PER_SQUARE_FOOT':
                comp.pricePerSquareFoot = self.cleanAmount(text)
            elif classification == 'PRICE_PER_SQUARE_FOOT_LAND':
                comp.pricePerSquareFootLand = self.cleanAmount(text)
            elif classification == 'PRICE_PER_ACRE_LAND':
                comp.pricePerAcreLand = self.cleanAmount(text)
            elif classification == 'PRICE_PER_SQUARE_FOOT_BUILDABLE_AREA':
                comp.pricePerSquareFootBuildableArea = self.cleanAmount(text)
            elif classification == 'PRICE_PER_BUILDABLE_UNIT':
                comp.pricePerBuildableUnit = self.cleanAmount(text)
            elif classification == 'NET_OPERATING_INCOME_PSF':
                comp.netOperatingIncomePSF = self.cleanAmount(text)
            elif classification == 'AVERAGE_MONTHLY_RENT_PER_UNIT':
                comp.averageMonthlyRentPerUnit = self.cleanAmount(text)
            elif classification == 'PRICE_PER_UNIT':
                comp.pricePerUnit = self.cleanAmount(text)
            elif classification == 'FLOOR_SPACE_INDEX':
                comp.floorSpaceIndex = self.cleanAmount(text)
            elif classification == 'DEVELOPMENT_PROPOSALS':
                if comp.developmentProposals is None:
                    comp.developmentProposals = ""
                comp.developmentProposals += text + " "
            elif classification == 'SIZE_OF_BUILDABLE_AREA_SQFT':
                comp.sizeOfBuildableAreaSqft = self.cleanAmount(text)
            elif classification == 'SIZE_OF_BUILDABLE_AREA_OFFICE_SQFT':
                pass # Handle Later
            elif classification == 'SIZE_OF_BUILDABLE_AREA_RESIDENTIAL_SQFT':
                pass # Handle Later
            elif classification == 'SIZE_OF_BUILDABLE_AREA_INSTITUTIONAL_SQFT':
                pass # Handle Later
            elif classification == 'SIZE_OF_BUILDABLE_AREA_RETAIL_SQFT':
                pass # Handle Later
            elif classification == 'BUILDABLE_UNITS':
                comp.buildableUnits = self.cleanAmount(text)
            elif classification == 'ASSEMBLY_SUB_PROPERTY_ADDRESS':
                pass # Handle when assemblies implemented
            elif classification == 'ASSEMBLY_SUB_PROPERTY_LAND_ACREAGE':
                pass # Handle when assemblies implemented
            elif classification == 'ASSEMBLY_SUB_PROPERTY_SQUARE_FOOTAGE':
                pass # Handle when assemblies implemented
            elif classification == 'ASSEMBLY_SUB_PROPERTY_PURCHASE_PRICE':
                pass # Handle when assemblies implemented
            elif classification == 'ASSEMBLY_SUB_PROPERTY_PURCHASE_DATE':
                pass # Handle when assemblies implemented
            elif classification == 'ASSEMBLY_AGGREGATE_PRICE':
                pass # Handle when assemblies implemented
            elif classification == 'ASSEMBLY_AGGREGATE_PRICE_PER_ACRE_LAND':
                pass # Handle when assemblies implemented
            elif classification == 'ASSEMBLY_AGGREGATE_PRICE_PER_SQUARE_FOOT_LAND':
                pass # Handle when assemblies implemented
            elif classification == 'ASSEMBLY_AGGREGATE_PRICE_PER_SQUARE_FOOT_BUILDABLE_AREA':
                pass # Handle when assemblies implemented
            elif classification == 'CLEAR_CEILING_HEIGHT':
                comp.clearCeilingHeight = self.cleanAmount(text)
            elif classification == 'SHIPPING_DOORS':
                comp.shippingDoors = self.cleanAmount(text)
            elif classification == 'SHIPPING_DOORS_DRIVE_IN':
                comp.shippingDoorsDriveIn = self.cleanAmount(text)
            elif classification == 'SHIPPING_DOORS_DOUBLE_MAN':
                comp.shippingDoorsDoubleMan = self.cleanAmount(text)
            elif classification == 'SHIPPING_DOORS_TRUCK_LEVEL':
                comp.shippingDoorsTruckLevel = self.cleanAmount(text)
            elif classification == 'FINISHED_OFFICE_PERCENTAGE':
                comp.finishedOfficePercent = self.cleanAmount(text)
            elif classification == 'FINISHED_OFFICE_SQUARE_FOOTAGE':
                finishedOfficeSquareFootage = self.cleanAmount(text)
                # TODO: This should be handled at the end of processing all the basic fields
                if comp.sizeSquareFootage:
                    comp.finishedOfficePercent = (finishedOfficeSquareFootage / comp.sizeSquareFootage) * 100
            elif classification == 'PRICE_PER_BEDROOM':
                comp.pricePerBedroom = self.cleanAmount(text)
            elif classification == 'BACHELOR_UNITS':
                comp.numberOfBachelors = self.cleanAmount(text)
            elif classification == 'ONE_BEDROOM_UNITS':
                comp.numberOfOneBedrooms = self.cleanAmount(text)
            elif classification == 'TWO_BEDROOM_UNITS':
                comp.numberOfTwoBedrooms = self.cleanAmount(text)
            elif classification == 'THREE_PLUS_BEDROOM_UNITS':
                comp.numberOfThreePlusBedrooms = self.cleanAmount(text)
            elif classification == 'TOTAL_BEDROOMS':
                comp.totalBedrooms = self.cleanAmount(text)
            elif classification == 'AMENITY_SQUARE_FOOTAGE':
                pass # Implement later
            elif classification == 'AMENITY_DESCRIPTION':
                pass # Implement later
        return comp
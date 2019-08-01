from mongoengine import *
import datetime
from appraisal.models.date_field import ConvertingDateField
import dateparser

class Tenancy(EmbeddedDocument):
    meta = {'strict': False}

    # The name of the tenant.
    name = StringField()

    # The monthly rent the tenant is paying.
    monthlyRent = FloatField()

    # The yearly rent the tenant is paying.
    yearlyRent = FloatField()

    # The free rent period in months
    freeRentMonths = FloatField()

    # The free rent period in months
    freeRentType = StringField(choices=["net", "gross", "", None], default="net", null=True)

    recoveryStructure = StringField(default="Standard")

    # This specifies the rent-type. This can be either "NET" or "GROSS"
    rentType = StringField(choices=["net", "gross", "", None], default="net", null=True)

    # The start date of the tenancy.
    startDate = ConvertingDateField()

    # The end date of the tenancy. If there is a predefined escalation schedule, then there will be separate tenancy objects for each escalation period.
    endDate = ConvertingDateField()

    def doesOverlapWith(self, otherTenancy):
        # This method returns True if this tenancy objects overlaps with the given
        # tenancy object (time-wise).
        # Otherwise returns False
        if otherTenancy.endDate is not None and self.startDate is not None and otherTenancy.endDate < self.startDate:
            return False

        if otherTenancy.startDate is not None and self.endDate is not None and otherTenancy.startDate > self.endDate:
            return False

        return True


class Unit(EmbeddedDocument):
    meta = {'strict': False}

    # The number of the unit, as it is used in the building.
    unitNumber = StringField()

    # The floor that the unit is on within the building.
    floorNumber = IntField()

    # This is the size of the unit in square feet.
    squareFootage = FloatField()

    # A list of occupants of this unit over various periods of time
    tenancies = ListField(EmbeddedDocumentField(Tenancy))

    # Market Rent
    marketRent = StringField()

    # Whether a market rent differential should be calculated
    shouldApplyMarketRentDifferential = BooleanField(default=False)

    # Whether the market rent should be used in place of the current rent in the stabilized statement
    shouldUseMarketRent = BooleanField(default=False)

    # Whether this unit should be considered vacant for the purposes of calculation
    shouldTreatAsVacant = BooleanField(default=None, null=True)

    # The Leasing Cost Structure
    leasingCostStructure = StringField(default="Standard")

    # General comments on the unit
    remarks = StringField()

    calculatedManagementRecovery = FloatField(default=0)

    calculatedExpenseRecovery = FloatField(default=0)

    calculatedTaxRecovery = FloatField(default=0)

    calculatedMarketRentDifferential = FloatField(default=0)

    calculatedFreeRentLoss = FloatField(default=0)

    calculatedVacantUnitRentLoss = FloatField(default=0)

    calculatedVacantUnitLeasupCosts = FloatField(default=0)

    calculatedFreeRentMonths = FloatField(default=0)

    calculatedFreeRentNetAmount = FloatField(default=0)

    @property
    def currentTenancy(self):
        currentDateTime = datetime.datetime.now()

        if len(self.tenancies) > 0:
            for tenancy in self.tenancies:
                if tenancy.startDate is not None and currentDateTime >= tenancy.startDate and tenancy.endDate is not None and currentDateTime <= tenancy.endDate:
                    return tenancy

            sortedTenancies = sorted(self.tenancies, key=lambda tenancy: (tenancy.startDate if tenancy.startDate is not None else currentDateTime) )

            return sortedTenancies[-1]
        else:
            return None

    @property
    def isVacantForStabilizedStatement(self):
        if self.shouldTreatAsVacant is not None:
            return self.shouldTreatAsVacant
        else:
            if self.currentTenancy.yearlyRent is not None and self.currentTenancy.yearlyRent > 0:
                return False
            else:
                return True

    @property
    def isVacantInFirstYear(self):
        # We check to see if it is vacant within the first year, and if so,
        oneYearDateTime = datetime.datetime.now() + datetime.timedelta(days=365)

        if len(self.tenancies) > 0:
            for tenancy in self.tenancies:
                if tenancy.startDate is not None and oneYearDateTime >= tenancy.startDate and tenancy.endDate is not None and oneYearDateTime <= tenancy.endDate:
                    if tenancy.yearlyRent and tenancy.yearlyRent > 0:
                        return False

            sortedTenancies = sorted(self.tenancies, key=lambda tenancy: (tenancy.startDate if tenancy.startDate is not None else oneYearDateTime) )

            firstTenancy = sortedTenancies[-1]

            if firstTenancy.yearlyRent and firstTenancy.yearlyRent > 0:
                return False

            return True
        else:
            return True


    def findTenancyAtDate(self, tenancyDate):
        for tenancy in self.tenancies:
            if tenancy.startDate and tenancy.startDate <= tenancyDate and tenancy.endDate and tenancy.endDate >= tenancyDate:
                return tenancy
        return None


    def mergeOtherUnitInfo(self, otherUnitInfo):
        if self.unitNumber is None:
            self.unitNumber = otherUnitInfo.unitNumber
        if self.floorNumber is None:
            self.floorNumber = otherUnitInfo.floorNumber
        if self.squareFootage is None:
            self.squareFootage = otherUnitInfo.squareFootage

        for tenancy in otherUnitInfo.tenancies:
            # See if this new tenancy conflicts with any existing tenancies.
            overlapTenancy = None
            for currentTenancy in self.tenancies:
                if currentTenancy.doesOverlapWith(tenancy):
                    overlapTenancy = currentTenancy
                    break
            if overlapTenancy is None:
                self.tenancies.append(tenancy)


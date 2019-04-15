from mongoengine import *
import datetime
from .date_field import ConvertingDateField
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

    # This gives what percentage the unit pays in management expenses
    managementRecoveryPercentage = FloatField()

    # This gives the field that the management expense is calculated based on
    managementRecoveryField = StringField()

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
    squareFootage = IntField()

    # A list of occupants of this unit over various periods of time
    tenancies = ListField(EmbeddedDocumentField(Tenancy))

    # Market Rent
    marketRent = StringField()

    # General comments on the unit
    remarks = StringField()

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


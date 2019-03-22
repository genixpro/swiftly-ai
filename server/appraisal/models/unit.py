from mongoengine import *
import datetime
from .date_field import ConvertingDateField
import dateparser

class Tenancy(EmbeddedDocument):
    # The name of the tenant.
    name = StringField()

    # The monthly rent the tenant is paying.
    monthlyRent = FloatField()

    # The yearly rent the tenant is paying.
    yearlyRent = FloatField()

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
    # The number of the unit, as it is used in the building.
    unitNumber = StringField()

    # The floor that the unit is on within the building.
    floorNumber = IntField()

    # This is the size of the unit in square feet.
    squareFootage = IntField()

    # A list of occupants of this unit over various periods of time
    tenancies = ListField(EmbeddedDocumentField(Tenancy))

    currentTenancy = EmbeddedDocumentField(Tenancy)

    # General comments on the unit
    remarks = StringField()

    def findTenancyAtDate(self, tenancyDate):
        for tenancy in self.tenancies:
            if tenancy.startDate and tenancy.startDate <= tenancyDate and tenancy.endDate and tenancy.endDate >= tenancyDate:
                return tenancy
        return None



    def updateCurrentTenancy(self):
        currentDateTime = datetime.datetime.now()

        if len(self.tenancies) > 0:
            for tenancy in self.tenancies:
                if tenancy.startDate is not None and currentDateTime >= tenancy.startDate and tenancy.endDate is not None and currentDateTime <= tenancy.endDate:
                    self.currentTenancy = tenancy
                    return

            sortedTenancies = sorted(self.tenancies, key=lambda tenancy: (tenancy.startDate if tenancy.startDate is not None else currentDateTime) )

            self.currentTenancy = sortedTenancies[-1]
        else:
            self.currentTenancy = None


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

        self.updateCurrentTenancy()

from appraisal.components.data_extractor import  DataExtractor
from appraisal.models.unit import Unit, Tenancy
import dateparser
import re


class TenancyDataExtractor (DataExtractor):
    """ This class is for extracting tenancy information from documents. """

    def __init__(self):
        pass

    def extractUnits(self, words):
        rentRolls = self.extractRentRoll(words)

        # Group the rent rolls by their unit number
        rentRollsByUnitNumber = {}

        for rentRoll in rentRolls:
            unit = rentRoll.get('UNIT_NUM', '')
            if unit in rentRollsByUnitNumber:
                rentRollsByUnitNumber[unit].append(rentRoll)
            else:
                rentRollsByUnitNumber[unit] = [rentRoll]

        units = []

        for unit in rentRollsByUnitNumber:
            newUnit = Unit()

            newUnit.unitNumber = unit
            newUnit.floorNumber = self.extractFloorNumber(unit)
            newUnit.squareFootage = self.cleanAmount(self.getFirstFieldFromRentRolls(rentRollsByUnitNumber[unit], 'RENTABLE_AREA'))

            newUnit.tenancies = []
            for rentRoll in rentRollsByUnitNumber[unit]:
                tenancy = Tenancy()
                tenancy.name = rentRoll.get('TENANT_NAME', '')
                tenancy.startDate = dateparser.parse(rentRoll.get('TERM_START', ''))
                tenancy.endDate = dateparser.parse(rentRoll.get('TERM_END', ''))
                tenancy.monthlyRent = self.cleanAmount(rentRoll.get('MONTHLY_RENT', 0))
                tenancy.yearlyRent = self.cleanAmount(rentRoll.get('YEARLY_RENT', 0))
                newUnit.tenancies.append(tenancy)

            units.append(newUnit)

        return units


    def getFirstFieldFromRentRolls(self, rentRolls, field):
        for rentRoll in rentRolls:
            if field in rentRoll:
                return rentRoll[field]
        return None

    def extractFloorNumber(self, unitNumber):
        digits = str(int(self.cleanAmount(unitNumber)))

        if len(digits) == 0:
            return 1
        elif len(digits) == 1:
            return 1
        elif len(digits) == 2:
            return 1
        elif len(digits) == 3:
            return int(digits[0])
        elif len(digits) == 4:
            return int(digits[:2])
        else:
            return int(digits[:2])


    def fillInRent(self, lineItem):
        if 'MONTHLY_RENT' in lineItem and 'YEARLY_RENT' not in lineItem:
            lineItem['YEARLY_RENT'] = self.cleanAmount(lineItem['MONTHLY_RENT']) * 12.0
        if 'YEARLY_RENT' in lineItem and 'MONTHLY_RENT' not in lineItem:
            lineItem['MONTHLY_RENT'] = self.cleanAmount(lineItem['YEARLY_RENT']) / 12.0

    def hasRentRollInfo(self, lineItem):
        rentRollFields = ['TENANT_NAME', 'UNIT_NUM']
        for field in rentRollFields:
            if field not in lineItem:
                return False
        return True

    def createLineItems(self, words):
        wordsByLine = {}
        for word in words:
            if word.documentLineNumber not in wordsByLine:
                wordsByLine[word.documentLineNumber] = [word]
            else:
                wordsByLine[word.documentLineNumber].append(word)

        lineItems = []
        for lineNumber in sorted(wordsByLine.keys()):
            line = wordsByLine[lineNumber]
            lineItem = {}
            for word in line:
                if word.classification != "null" and word.classification is not None:
                    if word.classification in lineItem:
                        lineItem[word.classification] += str(word.word)
                    else:
                        lineItem[word.classification] = str(word.word)

            lineItems.append(lineItem)

        return lineItems


    def extractRentRoll(self, words):
        rentRolls = []

        lineItems = self.createLineItems(words)

        lastValidItem = None
        for item in lineItems:
            if self.hasRentRollInfo(item):
                lastValidItem = item
            elif lastValidItem is not None:
                for key in lastValidItem:
                    if key not in item:
                        item[key] = lastValidItem[key]

        # Eliminate entries which don't contain all of the required rent-roll information
        lineItems = [item for item in lineItems if self.hasRentRollInfo(item)]

        for item in lineItems:
            self.fillInRent(item)

        rentRolls.extend(lineItems)

        return rentRolls

import subprocess
import copy
from ..models.appraisal_validation_result import AppraisalValidationResult

class AppraisalValidator:
    def __init__(self):
        pass

    def validateAppraisal(self, appraisal):
        result = AppraisalValidationResult()

        result.hasEscalations = self.checkEscalations(appraisal)
        result.hasRents = self.checkRents(appraisal)
        result.hasUnitSizes = self.checkUnitSizes(appraisal)
        result.hasTenantNames = self.checkTenantNames(appraisal)
        result.hasLeaseTerms = self.checkLeaseTerms(appraisal)
        result.hasRentRoll = result.hasEscalations and result.hasRents and result.hasUnitSizes and result.hasTenantNames and result.hasLeaseTerms

        result.hasExpenses = self.checkExpenses(appraisal)
        result.hasTaxes = self.checkTaxes(appraisal)
        result.hasAdditionalIncome = self.checkAdditionalIncome(appraisal)
        result.hasAmortizations = self.checkAmortization(appraisal)
        result.hasFinancialInfo = result.hasExpenses and result.hasTaxes and result.hasAdditionalIncome

        result.hasAddress = self.checkAddress(appraisal)
        result.hasPropertyType = self.checkPropertyType(appraisal)
        result.hasBuildingSize = self.checkBuildingSize(appraisal)
        result.hasLotSize = self.checkLotSize(appraisal)
        result.hasZoning = self.checkZoning(appraisal)
        result.hasBuildingInformation = result.hasAddress and result.hasPropertyType and result.hasBuildingSize and result.hasLotSize and result.hasZoning

        return result

    def checkIncomeStatement(self, appraisal):
        if appraisal.incomeStatement is not None and len(appraisal.incomeStatement.expenses) > 0:
            return True
        return False


    def checkBuildingInformation(self, appraisal):
        buildingFields = ['name', 'address']

        hasAllBuildingFields = True
        for field in buildingFields:
            if getattr(appraisal, field) is None or getattr(appraisal, field) == "":
                hasAllBuildingFields = False

        return hasAllBuildingFields


    def checkEscalations(self, appraisal):
        for unit in appraisal.units:
            if len(unit.tenancies) > 1:
                return True
        return False

    def checkRents(self, appraisal):
        if len(appraisal.units) == 0:
            return False

        for unit in appraisal.units:
            if unit.currentTenancy and unit.currentTenancy.yearlyRent is None:
                return False
        return True

    def checkTenantNames(self, appraisal):
        if len(appraisal.units) == 0:
            return False

        for unit in appraisal.units:
            if unit.currentTenancy and unit.currentTenancy.name is None:
                return False
        return True

    def checkUnitSizes(self, appraisal):
        if len(appraisal.units) == 0:
            return False

        for unit in appraisal.units:
            if unit.squareFootage is None:
                return False
        return True

    def checkLeaseTerms(self, appraisal):
        if len(appraisal.units) == 0:
            return False

        for unit in appraisal.units:
            for tenancy in unit.tenancies:
                if tenancy.startDate is None or tenancy.endDate is None:
                    return False
        return True


    def checkExpenses(self, appraisal):
        if appraisal.stabilizedStatement.operatingExpenses and appraisal.stabilizedStatement.operatingExpenses > 0:
            return True
        return False


    def checkTaxes(self, appraisal):
        if appraisal.stabilizedStatement.taxes and appraisal.stabilizedStatement.taxes > 0:
            return True
        return False

    def checkAdditionalIncome(self, appraisal):
        if appraisal.stabilizedStatement.additionalIncome and appraisal.stabilizedStatement.additionalIncome > 0:
            return True
        return False

    def checkAmortization(self, appraisal):
        if appraisal.stabilizedStatement.amortizationDifferential and appraisal.stabilizedStatement.amortizationDifferential > 0:
            return True
        return False

    def checkAddress(self, appraisal):
        if appraisal.address:
            return True
        return False

    def checkPropertyType(self, appraisal):
        if appraisal.propertyType:
            return True
        return False

    def checkBuildingSize(self, appraisal):
        if appraisal.sizeOfBuilding:
            return True
        return False

    def checkLotSize(self, appraisal):
        if appraisal.sizeOfLand:
            return True
        return False

    def checkZoning(self, appraisal):
        if appraisal.zoning:
            return True
        return False


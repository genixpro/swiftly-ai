import subprocess
import copy
from ..models.appraisal_validation_result import AppraisalValidationResult

class AppraisalValidator:
    def __init__(self):
        pass

    def validateAppraisal(self, appraisal):
        result = AppraisalValidationResult()

        result.hasIncomeStatement = self.checkIncomeStatement(appraisal)
        result.hasBuildingInformation = self.checkBuildingInformation(appraisal)
        result.hasRentRoll = self.checkRentRoll(appraisal)

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


    def checkRentRoll(self, appraisal):
        if len(appraisal.units) > 0:
            return True
        return False
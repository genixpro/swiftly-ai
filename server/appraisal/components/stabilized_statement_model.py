from appraisal.components.document_extractor_dataset import DocumentExtractorDataset
import dateparser
from dateutil.relativedelta import relativedelta
import datetime
import re
import numpy
import copy
import math
from pprint import pprint
from appraisal.models.discounted_cash_flow import MonthlyCashFlowItem, YearlyCashFlowItem, DiscountedCashFlow, DiscountedCashFlowSummary, DiscountedCashFlowSummaryItem
from appraisal.models.stabilized_statement import StabilizedStatement
from appraisal.components.valuation_model_base import ValuationModelBase
from .valuation_errors import CalculationError

class StabilizedStatementModel(ValuationModelBase):
    """ This class encapsulates the code required for producing a stabilized statement"""


    def createStabilizedStatement(self, appraisal):
        statement = StabilizedStatement()

        statement.calculationErrorFields = []
        statement.calculationErrors = {}

        self.calculateValueWithErrorChecking(statement, 'rentalIncome', lambda: self.computeRentalIncome(appraisal))
        self.calculateValueWithErrorChecking(statement, 'additionalIncome', lambda: self.computeAdditionalIncome(appraisal))

        self.calculateValueWithErrorChecking(statement, 'managementExpenses', lambda: self.computeManagementFees(appraisal))

        if appraisal.stabilizedStatementInputs.expensesMode == 'income_statement':
            self.calculateValueWithErrorChecking(statement, 'operatingExpenses', lambda: self.computeTotalOperatingExpenses(appraisal))
            self.calculateValueWithErrorChecking(statement, 'taxes', lambda: self.computeTaxes(appraisal))
        elif appraisal.stabilizedStatementInputs.expensesMode == 'tmi':
            if appraisal.sizeOfBuilding and appraisal.stabilizedStatementInputs.tmiRatePSF:
                self.calculateValueWithErrorChecking(statement, 'tmiTotal', lambda: appraisal.stabilizedStatementInputs.tmiRatePSF * appraisal.sizeOfBuilding)
            else:
                statement.tmiTotal = 0

        self.calculateValueWithErrorChecking(statement, 'marketRentDifferential', lambda: self.computeMarketRentDifferentials(appraisal))
        self.calculateValueWithErrorChecking(statement, 'freeRentRentLoss', lambda: self.computeFreeRentRentLoss(appraisal))

        self.calculateValueWithErrorChecking(statement, 'vacantUnitRentLoss', lambda: self.computeVacantUnitRentLoss(appraisal))
        self.calculateValueWithErrorChecking(statement, 'vacantUnitLeasupCosts', lambda: self.computeVacantUnitLeasupCosts(appraisal))

        self.calculateValueWithErrorChecking(statement, 'amortizedCapitalInvestment', lambda: self.computeAmortizedCapitalInvestment(appraisal))
        self.calculateValueWithErrorChecking(statement, 'managementRecovery', lambda: self.computeManagementRecoveries(appraisal))
        self.calculateValueWithErrorChecking(statement, 'operatingExpenseRecovery', lambda: self.computeOperatingExpenseRecoveries(appraisal))
        self.calculateValueWithErrorChecking(statement, 'taxRecovery', lambda: self.computeTaxRecoveries(appraisal))
        self.calculateValueWithErrorChecking(statement, 'recoverableIncome', lambda: self.computeTotalRecoverableIncome(appraisal))
        
        self.calculateValueWithErrorChecking(statement, 'potentialGrossIncome', lambda: self.computePotentialGrossIncome(appraisal))

        self.calculateValueWithErrorChecking(statement, 'vacancyDeduction', lambda: self.computeVacancyDeduction(appraisal))

        self.calculateValueWithErrorChecking(statement, 'effectiveGrossIncome', lambda: self.computeEffectiveGrossIncome(appraisal))

        if appraisal.stabilizedStatementInputs.managementExpenseMode != 'combined_structural_rule':
            statement.structuralAllowance = statement.potentialGrossIncome * (appraisal.stabilizedStatementInputs.structuralAllowancePercent / 100.0)
        else:
            statement.structuralAllowance = 0

        if appraisal.stabilizedStatementInputs.expensesMode == 'income_statement':
            statement.totalExpenses = statement.operatingExpenses + statement.taxes + statement.managementExpenses + statement.structuralAllowance
        elif appraisal.stabilizedStatementInputs.expensesMode == 'tmi':
            statement.totalExpenses = statement.tmiTotal + statement.managementExpenses + statement.structuralAllowance
        else:
            statement.totalExpenses = 0

        statement.netOperatingIncome = statement.effectiveGrossIncome - statement.totalExpenses

        statement.capitalization = statement.netOperatingIncome / (appraisal.stabilizedStatementInputs.capitalizationRate / 100.0)

        statement.valuation = statement.capitalization

        if appraisal.stabilizedStatementInputs.applyMarketRentDifferential:
            statement.valuation += statement.marketRentDifferential

        if appraisal.stabilizedStatementInputs.applyFreeRentLoss:
            statement.valuation += statement.freeRentRentLoss

        if appraisal.stabilizedStatementInputs.applyVacantUnitRentLoss:
            statement.valuation += statement.vacantUnitRentLoss

        if appraisal.stabilizedStatementInputs.applyVacantUnitLeasingCosts:
            statement.valuation += statement.vacantUnitLeasupCosts

        if appraisal.stabilizedStatementInputs.applyAmortization:
            statement.valuation += statement.amortizedCapitalInvestment

        for modifier in appraisal.stabilizedStatementInputs.modifiers:
            if modifier.amount:
                statement.valuation += modifier.amount

        if statement.valuation == 0:
            statement.valuationRounded = 0
        else:
            statement.valuationRounded = round(statement.valuation, -int(math.floor(math.log10(abs(statement.valuation)))) + 2) # Round to 3 significant figures

        return statement

    def calculateValueWithErrorChecking(self, statement, valueName, valueFunc):
        try:
            setattr(statement, valueName, valueFunc())
        except CalculationError as error:
            setattr(statement, valueName, 0)
            statement.calculationErrorFields.append(valueName)
            statement.calculationErrors[valueName] = str(error)
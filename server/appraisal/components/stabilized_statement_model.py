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


class StabilizedStatementModel(ValuationModelBase):
    """ This class encapsulates the code required for producing a stabilized statement"""


    def createStabilizedStatement(self, appraisal):
        statement = StabilizedStatement()

        statement.rentalIncome = self.computeRentalIncome(appraisal)
        statement.additionalIncome = self.computeAdditionalIncome(appraisal)

        if appraisal.stabilizedStatementInputs.expensesMode == 'income_statement':
            statement.managementExpenses = self.computeManagementFees(appraisal)
            statement.operatingExpenses = self.computeTotalOperatingExpenses(appraisal)
            statement.taxes = self.computeTaxes(appraisal)
        elif appraisal.stabilizedStatementInputs.expensesMode == 'tmi':
            if appraisal.sizeOfBuilding and appraisal.stabilizedStatementInputs.tmiRatePSF:
                statement.tmiTotal = appraisal.stabilizedStatementInputs.tmiRatePSF * appraisal.sizeOfBuilding
            else:
                statement.tmiTotal = 0

        statement.marketRentDifferential = self.computeMarketRentDifferentials(appraisal)
        statement.freeRentRentLoss = self.computeFreeRentRentLoss(appraisal)

        statement.vacantUnitRentLoss = self.computeVacantUnitRentLoss(appraisal)
        statement.vacantUnitLeasupCosts = self.computeVacantUnitLeasupCosts(appraisal)

        statement.amortizedCapitalInvestment = self.computeAmortizedCapitalInvestment(appraisal)
        statement.managementRecovery = self.computeManagementRecoveries(appraisal)
        statement.operatingExpenseRecovery = self.computeOperatingExpenseRecoveries(appraisal)
        statement.taxRecovery = self.computeTaxRecoveries(appraisal)
        statement.recoverableIncome = self.computeTotalRecoverableIncome(appraisal)
        
        statement.potentialGrossIncome = self.computePotentialGrossIncome(appraisal)

        statement.vacancyDeduction = self.computeVacancyDeduction(appraisal)

        statement.effectiveGrossIncome = self.computeEffectiveGrossIncome(appraisal)

        if appraisal.stabilizedStatementInputs.managementExpenseMode != 'combined_structural_rule':
            statement.structuralAllowance = statement.potentialGrossIncome * (appraisal.stabilizedStatementInputs.structuralAllowancePercent / 100.0)
        else:
            statement.structuralAllowance = 0

        if appraisal.stabilizedStatementInputs.expensesMode == 'income_statement':
            statement.totalExpenses = statement.operatingExpenses + statement.taxes + statement.managementExpenses + statement.structuralAllowance
        elif appraisal.stabilizedStatementInputs.expensesMode == 'tmi':
            statement.totalExpenses = statement.tmiTotal + statement.structuralAllowance
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

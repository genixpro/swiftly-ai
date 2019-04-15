from .document_extractor_dataset import DocumentExtractorDataset
import dateparser
from dateutil.relativedelta import relativedelta
import datetime
import re
import numpy
import copy
import math
from pprint import pprint
from ..models.discounted_cash_flow import MonthlyCashFlowItem, YearlyCashFlowItem, DiscountedCashFlow, DiscountedCashFlowSummary, DiscountedCashFlowSummaryItem
from ..models.stabilized_statement import StabilizedStatement
from .valuation_model_base import ValuationModelBase

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
            if appraisal.sizeOfBuilding:
                statement.tmiTotal = appraisal.stabilizedStatementInputs.tmiRatePSF * appraisal.sizeOfBuilding
            else:
                statement.tmiTotal = 0

        statement.marketRentDifferential = self.computeMarketRentDifferentials(appraisal)
        statement.freeRentDifferential = self.computeFreeRentDifferentials(appraisal)
        statement.vacantUnitDifferential = self.computeVacantUnitDifferential(appraisal)
        statement.amortizationDifferential = self.computeAmortizationDifferential(appraisal)
        statement.recoverableIncome = self.computeRecoverableOperatingExpenses(appraisal) * self.computeRecoverablePercentage(appraisal) + self.computeManagementRecoveries(appraisal, statement)

        statement.potentialGrossIncome = statement.rentalIncome + statement.additionalIncome + statement.recoverableIncome

        statement.vacancyDeduction = statement.potentialGrossIncome * (appraisal.stabilizedStatementInputs.vacancyRate / 100.0)

        statement.effectiveGrossIncome = statement.potentialGrossIncome - statement.vacancyDeduction

        statement.structuralAllowance = statement.effectiveGrossIncome * (appraisal.stabilizedStatementInputs.structuralAllowancePercent / 100.0)

        if appraisal.stabilizedStatementInputs.expensesMode == 'income_statement':
            statement.totalExpenses = statement.operatingExpenses + statement.taxes + statement.managementExpenses + statement.structuralAllowance
        elif appraisal.stabilizedStatementInputs.expensesMode == 'tmi' and appraisal.sizeOfBuilding:
            statement.totalExpenses = statement.tmiTotal + statement.structuralAllowance

        statement.netOperatingIncome = statement.effectiveGrossIncome - statement.totalExpenses

        statement.capitalization = statement.netOperatingIncome / (appraisal.stabilizedStatementInputs.capitalizationRate / 100.0)

        statement.valuation = statement.capitalization + statement.marketRentDifferential + statement.freeRentDifferential + statement.vacantUnitDifferential + statement.amortizationDifferential

        for modifier in appraisal.stabilizedStatementInputs.modifiers:
            if modifier.amount:
                statement.valuation += modifier.amount

        if statement.valuation == 0:
            statement.valuationRounded = 0
        else:
            statement.valuationRounded = round(statement.valuation, -int(math.floor(math.log10(abs(statement.valuation)))) + 2) # Round to 3 significant figures

        return statement



    def getStabilizedRent(self, appraisal, unit):
        if unit.currentTenancy and unit.currentTenancy.yearlyRent:
            return unit.currentTenancy.yearlyRent
        else:
            rent = self.getMarketRent(appraisal, unit.marketRent)
            if rent:
                return rent
            return 0



    def computeRecoverablePercentage(self, appraisal):
        totalSize = 0
        totalNetSize = 0

        for unit in appraisal.units:
            totalSize += unit.squareFootage

            if unit.currentTenancy and unit.currentTenancy.rentType == 'net':
                totalNetSize += unit.squareFootage

        if totalSize == 0:
            return 1.0

        return float(totalNetSize) / float(totalSize)


    def computeRentalIncome(self, appraisal):
        total = 0

        for unit in appraisal.units:
            if unit.currentTenancy and unit.currentTenancy.yearlyRent is not None:
                total += self.getStabilizedRent(appraisal, unit)

        return total


    def computeAdditionalIncome(self, appraisal):
        total = 0

        for income in appraisal.incomeStatement.incomes:
            if income.incomeStatementItemType == 'additional_income':
                total += self.getLatestAmount(income)

        return total


    def computeRecoverableOperatingExpenses(self, appraisal):
        total = 0

        for expense in appraisal.incomeStatement.expenses:
            if expense.incomeStatementItemType == 'operating_expense':
                total += self.getLatestAmount(expense)

        return total


    def computeTotalOperatingExpenses(self, appraisal):
        total = 0

        for expense in appraisal.incomeStatement.expenses:
            if expense.incomeStatementItemType == 'operating_expense':
                total += self.getLatestAmount(expense)

        return total


    def computeTaxes(self, appraisal):
        total = 0

        for expense in appraisal.incomeStatement.expenses:
            if expense.incomeStatementItemType == 'taxes':
                total += self.getLatestAmount(expense)

        return total


    def computeManagementFees(self, appraisal):
        total = 0

        for expense in appraisal.incomeStatement.expenses:
            if expense.incomeStatementItemType == 'management_expense':
                total += self.getLatestAmount(expense)

        return total


    def computeManagementRecoveries(self, appraisal, statement):
        total = 0

        for unit in appraisal.units:
            if unit.currentTenancy and unit.currentTenancy.managementRecoveryPercentage and unit.currentTenancy.managementRecoveryField:
                if unit.currentTenancy.managementRecoveryField == "operatingExpenses":
                    total += (unit.currentTenancy.managementRecoveryPercentage / 100.0) * statement.operatingExpenses
                if unit.currentTenancy.managementRecoveryField == "managementExpenses":
                    total += (unit.currentTenancy.managementRecoveryPercentage / 100.0) * statement.managementExpenses
                if unit.currentTenancy.managementRecoveryField == "rentalIncome":
                    total += (unit.currentTenancy.managementRecoveryPercentage / 100.0) * statement.rentalIncome

        return total

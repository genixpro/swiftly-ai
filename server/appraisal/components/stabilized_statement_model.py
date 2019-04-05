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

class StabilizedStatementModel:
    """ This class encapsulates the code required for producing a stabilized statement"""


    def createStabilizedStatement(self, appraisal):
        statement = StabilizedStatement()

        statement.rentalIncome = self.computeRentalIncome(appraisal)
        statement.additionalIncome = self.computeAdditionalIncome(appraisal)
        statement.recoverableIncome = self.computeRecoverableOperatingExpenses(appraisal) * self.computeRecoverablePercentage(appraisal)

        statement.potentialGrossIncome = statement.rentalIncome + statement.additionalIncome + statement.recoverableIncome

        statement.vacancyDeduction = statement.potentialGrossIncome * (appraisal.stabilizedStatementInputs.vacancyRate / 100.0)

        statement.effectiveGrossIncome = statement.potentialGrossIncome - statement.vacancyDeduction

        statement.operatingExpenses = self.computeTotalOperatingExpenses(appraisal)

        statement.taxes = self.computeTaxes(appraisal)

        statement.managementExpenses = self.computeManagementFees(appraisal)

        statement.structuralAllowance = self.computeStructuralAllowance(appraisal)

        statement.totalExpenses = statement.operatingExpenses + statement.taxes + statement.managementExpenses + statement.structuralAllowance

        statement.netOperatingIncome = statement.effectiveGrossIncome - statement.totalExpenses

        statement.valuation = statement.netOperatingIncome / (appraisal.stabilizedStatementInputs.capitalizationRate / 100.0)

        statement.valuationRounded = round(statement.valuation, -int(math.floor(math.log10(abs(statement.valuation)))) + 2) # Round to 3 significant figures

        return statement


    def getLatestAmount(self, incomeStatementItem):
        years = sorted(incomeStatementItem.yearlyAmounts.keys(), key=lambda x: float(x))
        if len(years) == 0:
            return 0
        return incomeStatementItem.yearlyAmounts[years[-1]]


    def computeRecoverablePercentage(self, appraisal):
        totalSize = 0
        totalNetSize = 0

        for unit in appraisal.units:
            totalSize += unit.squareFootage

            if unit.currentTenancy.rentType == 'net':
                totalNetSize += unit.squareFootage

        return float(totalNetSize) / float(totalSize)


    def computeRentalIncome(self, appraisal):
        total = 0

        for unit in appraisal.units:
            if unit.currentTenancy.yearlyRent is not None:
                total += unit.currentTenancy.yearlyRent

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
            if expense.incomeStatementItemType == 'operating_expense' or expense.incomeStatementItemType == 'non_recoverable_expense':
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


    def computeStructuralAllowance(self, appraisal):
        total = 0

        for expense in appraisal.incomeStatement.expenses:
            if expense.incomeStatementItemType == 'structural_allowance':
                total += self.getLatestAmount(expense)

        return total






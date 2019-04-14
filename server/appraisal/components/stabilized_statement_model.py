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

        statement.capitalization = statement.netOperatingIncome / (appraisal.stabilizedStatementInputs.capitalizationRate / 100.0)

        statement.marketRentDifferential = self.computeMarketRentDifferentials(appraisal)

        statement.valuation = statement.capitalization + statement.marketRentDifferential

        for modifier in appraisal.stabilizedStatementInputs.modifiers:
            if modifier.amount:
                statement.valuation += modifier.amount

        if statement.valuation == 0:
            statement.valuationRounded = 0
        else:
            statement.valuationRounded = round(statement.valuation, -int(math.floor(math.log10(abs(statement.valuation)))) + 2) # Round to 3 significant figures

        return statement


    def getLatestAmount(self, incomeStatementItem):
        years = sorted(incomeStatementItem.yearlyAmounts.keys(), key=lambda x: float(x))
        if len(years) == 0:
            return 0
        return incomeStatementItem.yearlyAmounts[years[-1]]

    def getMarketRent(self, appraisal, name):
        for marketRent in appraisal.marketRents:
            if marketRent.name == name:
                return marketRent.amountPSF


    def computeMarketRentDifferentials(self, appraisal):
        totalDifferential = 0

        for unit in appraisal.units:
            if unit.yearlyRent and unit.squareFootage and unit.marketRent and self.getMarketRent(appraisal, unit.marketRent):
                presentDifferentialPSF = (unit.currentTenancy.yearlyRent / unit.squareFootage) - self.getMarketRent(appraisal, unit.marketRent)

                monthlyDifferentialCashflow = (presentDifferentialPSF * unit.squareFootage) / 12.0

                startDate = datetime.datetime.now()
                endDate = unit.currentTenancy.endDate

                currentDate = copy.copy(startDate)

                monthlyDiscount = math.pow(1.0 + (appraisal.stabilizedStatementInputs.marketRentDifferentialDiscountRate / 100), 1 / 12.0)

                month = 0

                while currentDate < endDate:
                    totalDiscount = monthlyDiscount ** month

                    totalDifferential += monthlyDifferentialCashflow / totalDiscount

                    currentDate = currentDate + relativedelta(months=1)
                    month += 1

        return float(totalDifferential)


    def computeRecoverablePercentage(self, appraisal):
        totalSize = 0
        totalNetSize = 0

        for unit in appraisal.units:
            totalSize += unit.squareFootage

            if unit.currentTenancy.rentType == 'net':
                totalNetSize += unit.squareFootage

        if totalSize == 0:
            return 1.0

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


    def computeStructuralAllowance(self, appraisal):
        total = 0

        for expense in appraisal.incomeStatement.expenses:
            if expense.incomeStatementItemType == 'structural_allowance':
                total += self.getLatestAmount(expense)

        return total






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
        statement.managementExpenses = self.computeManagementFees(appraisal)
        statement.operatingExpenses = self.computeTotalOperatingExpenses(appraisal)
        statement.taxes = self.computeTaxes(appraisal)
        statement.marketRentDifferential = self.computeMarketRentDifferentials(appraisal)
        statement.freeRentDifferential = self.computeFreeRentDifferentials(appraisal)
        statement.vacantUnitDifferential = self.computeVacantUnitDifferential(appraisal)
        statement.recoverableIncome = self.computeRecoverableOperatingExpenses(appraisal) * self.computeRecoverablePercentage(appraisal) + self.computeManagementRecoveries(appraisal, statement)

        statement.potentialGrossIncome = statement.rentalIncome + statement.additionalIncome + statement.recoverableIncome

        statement.vacancyDeduction = statement.potentialGrossIncome * (appraisal.stabilizedStatementInputs.vacancyRate / 100.0)

        statement.effectiveGrossIncome = statement.potentialGrossIncome - statement.vacancyDeduction

        statement.structuralAllowance = statement.effectiveGrossIncome * (appraisal.stabilizedStatementInputs.structuralAllowancePercent / 100.0)

        statement.totalExpenses = statement.operatingExpenses + statement.taxes + statement.managementExpenses + statement.structuralAllowance

        statement.netOperatingIncome = statement.effectiveGrossIncome - statement.totalExpenses

        statement.capitalization = statement.netOperatingIncome / (appraisal.stabilizedStatementInputs.capitalizationRate / 100.0)

        statement.valuation = statement.capitalization + statement.marketRentDifferential + statement.freeRentDifferential + statement.vacantUnitDifferential

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


    def getStabilizedRent(self, appraisal, unit):
        if unit.currentTenancy and unit.currentTenancy.yearlyRent:
            return unit.currentTenancy.yearlyRent
        else:
            rent = self.getMarketRent(appraisal, unit.marketRent)
            if rent:
                return rent
            return 0


    def computeMarketRentDifferentials(self, appraisal):
        totalDifferential = 0

        for unit in appraisal.units:
            if unit.currentTenancy and unit.currentTenancy.yearlyRent and unit.squareFootage and unit.marketRent and self.getMarketRent(appraisal, unit.marketRent):
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


    def computeFreeRentDifferentials(self, appraisal):
        totalDifferential = 0

        for unit in appraisal.units:
            if unit.currentTenancy and unit.currentTenancy.yearlyRent and unit.currentTenancy.freeRentMonths:
                monthsFromStart = (datetime.datetime.now() - unit.currentTenancy.startDate).total_seconds() / (60 * 60 * 24 * 30.3)

                freeRentMonthsRemaining = int(max(unit.currentTenancy.freeRentMonths - monthsFromStart, 0))

                differential = freeRentMonthsRemaining * unit.currentTenancy.yearlyRent / 12.0

                totalDifferential += differential

        return -float(totalDifferential)


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

    def computeVacantUnitDifferential(self, appraisal):
        total = 0

        for unit in appraisal.units:
            if unit.isVacantInFirstYear and unit.squareFootage and unit.marketRent:
                total += appraisal.discountedCashFlowInputs.tenantInducementsPSF * unit.squareFootage + appraisal.discountedCashFlowInputs.leasingCommission + self.getMarketRent(appraisal, unit.marketRent) * unit.squareFootage

        return -total






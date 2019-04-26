from dateutil.relativedelta import relativedelta
import datetime
import math
import copy
import dateutil
from appraisal.models.leasing_cost_structure import LeasingCostStructure


class ValuationModelBase:
    """ Base class for valuation models, with some common functionality. """

    def getEffectiveDate(self, appraisal):
        effectiveDate = appraisal.effectiveDate if appraisal.effectiveDate else datetime.datetime.now()

        return effectiveDate

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
        if unit.squareFootage and unit.marketRent and self.getMarketRent(appraisal, unit.marketRent) and unit.shouldUseMarketRent:
            return self.getMarketRent(appraisal, unit.marketRent) * unit.squareFootage
        elif unit.currentTenancy and unit.currentTenancy.yearlyRent:
            return unit.currentTenancy.yearlyRent
        else:
            return 0

    def getLeasingCostStructure(self, appraisal, name):
        for leasingCost in appraisal.leasingCosts:
            if leasingCost.name == name:
                return leasingCost

        for leasingCost in appraisal.leasingCosts:
            if leasingCost.name.lower() == "standard":
                return leasingCost

        return LeasingCostStructure()

    def computeMarketRentDifferentials(self, appraisal):
        totalDifferential = 0

        for unit in appraisal.units:
            unit.calculatedMarketRentDifferential = 0

            if unit.currentTenancy and unit.currentTenancy.yearlyRent and unit.squareFootage and unit.marketRent and self.getMarketRent(appraisal, unit.marketRent) and unit.shouldApplyMarketRentDifferential:
                presentDifferentialPSF = (unit.currentTenancy.yearlyRent / unit.squareFootage) - self.getMarketRent(appraisal, unit.marketRent)

                monthlyDifferentialCashflow = (presentDifferentialPSF * unit.squareFootage) / 12.0

                startDate = self.getEffectiveDate(appraisal)
                endDate = unit.currentTenancy.endDate

                currentDate = copy.copy(startDate)

                monthlyDiscount = math.pow(1.0 + (appraisal.stabilizedStatementInputs.marketRentDifferentialDiscountRate / 100), 1 / 12.0)

                month = 0

                while currentDate < endDate:
                    totalDiscount = monthlyDiscount ** month

                    currentDifferential = monthlyDifferentialCashflow / totalDiscount

                    totalDifferential += currentDifferential

                    unit.calculatedMarketRentDifferential += currentDifferential

                    currentDate = currentDate + relativedelta(months=1)
                    month += 1

        return float(totalDifferential)


    def computeFreeRentRentLoss(self, appraisal):
        totalRentLoss = 0

        for unit in appraisal.units:
            unit.calculatedFreeRentLoss = 0
            unit.calculatedFreeRentMonths = 0

            if unit.currentTenancy and unit.currentTenancy.yearlyRent and unit.currentTenancy.freeRentMonths:
                monthsFromStart = relativedelta(self.getEffectiveDate(appraisal), unit.currentTenancy.startDate).months
                freeRentMonthsRemaining = int(max(unit.currentTenancy.freeRentMonths - monthsFromStart, 0))

                unit.calculatedFreeRentMonths = freeRentMonthsRemaining

                if unit.currentTenancy.freeRentType == 'gross':
                    unit.calculatedFreeRentNetAmount = self.getStabilizedRent(appraisal, unit)

                    currentRentLoss = freeRentMonthsRemaining * unit.calculatedFreeRentNetAmount / 12.0
                else:
                    unitRecoveries = self.computeTaxRecoveriesForUnit(appraisal, unit) + self.computeManagementRecoveriesForUnit(appraisal, unit) + self.computeOperatingExpenseRecoveriesForUnit(appraisal, unit)

                    unit.calculatedFreeRentNetAmount = self.getStabilizedRent(appraisal, unit) + unitRecoveries

                    currentRentLoss = freeRentMonthsRemaining * unit.calculatedFreeRentNetAmount / 12.0

                totalRentLoss += currentRentLoss

                unit.calculatedFreeRentLoss += currentRentLoss

        return -float(totalRentLoss)


    def computeVacantUnitRentLoss(self, appraisal):
        total = 0

        for unit in appraisal.units:
            unit.calculatedVacantUnitRentLoss = 0

            if unit.isVacantForStabilizedStatement and unit.squareFootage and unit.marketRent and self.getMarketRent(appraisal, unit.marketRent):
                leasingCosts = self.getLeasingCostStructure(appraisal, unit.leasingCostStructure)

                currentRentLoss = (self.getMarketRent(appraisal, unit.marketRent) * unit.squareFootage) / 12.0 * leasingCosts.renewalPeriod

                unit.calculatedVacantUnitRentLoss += currentRentLoss
                total += currentRentLoss

        return -total


    def computeVacantUnitLeasupCosts(self, appraisal):
        total = 0

        for unit in appraisal.units:
            unit.calculatedVacantUnitLeasupCosts = 0

            if unit.isVacantForStabilizedStatement and unit.squareFootage:
                leasingCosts = self.getLeasingCostStructure(appraisal, unit.leasingCostStructure)

                currentLeaseUpCosts = leasingCosts.tenantInducementsPSF * unit.squareFootage

                if leasingCosts.leasingCommissionMode == 'psf':
                    currentLeaseUpCosts += leasingCosts.leasingCommissionPSF * unit.squareFootage
                elif leasingCosts.leasingCommissionMode == "percent_of_rent" and unit.marketRent and self.getMarketRent(appraisal, unit.marketRent):
                    currentLeaseUpCosts += (leasingCosts.leasingCommissionPercent / 100.0) * self.getMarketRent(appraisal, unit.marketRent) * unit.squareFootage

                unit.calculatedVacantUnitLeasupCosts += currentLeaseUpCosts

                total += currentLeaseUpCosts

        return -total


    def computeAmortizedCapitalInvestment(self, appraisal):
        total = 0

        for item in appraisal.amortizationSchedule.items:
            if item.startDate and item.periodMonths and item.amount and item.interest and item.discountRate:
                monthsFromStart = relativedelta(self.getEffectiveDate(appraisal), item.startDate).months
                monthsRemaining = item.periodMonths - monthsFromStart

                monthlyInterest = math.pow(1.0 + (item.interest / 100), 1 / 12.0)
                monthlyDiscount = math.pow(1.0 + (item.discountRate / 100), 1 / 12.0)
                monthlyAmount = item.amount / item.periodMonths

                for month in range(int(monthsRemaining)):
                    currentInterest = math.pow(monthlyInterest, month)
                    currentDiscount = math.pow(monthlyDiscount, month)
                    currentAmount = currentInterest / currentDiscount * monthlyAmount

                    total += currentAmount

        return total


    def getRecoveryStructure(self, appraisal, name):
        for recovery in appraisal.recoveryStructures:
            if recovery.name == name:
                return recovery
        return None

    def getDefaultRecoveryStructure(self, appraisal):
        for recovery in appraisal.recoveryStructures:
            if 'default' in recovery.name.lower():
                return recovery
        return appraisal.recoveryStructures[0]


    def computeTotalRecoverableIncome(self, appraisal):
        return self.computeManagementRecoveries(appraisal) + self.computeOperatingExpenseRecoveries(appraisal) + self.computeTaxRecoveries(appraisal)

    def computePotentialGrossIncome(self, appraisal):
        return self.computeRentalIncome(appraisal) + self.computeAdditionalIncome(appraisal) + self.computeTotalRecoverableIncome(appraisal)

    def computeVacancyDeduction(self, appraisal):
        return self.computePotentialGrossIncome(appraisal) * (appraisal.stabilizedStatementInputs.vacancyRate / 100.0)

    def computeEffectiveGrossIncome(self, appraisal):
        return self.computePotentialGrossIncome(appraisal) - self.computeVacancyDeduction(appraisal)


    def computeRentalIncome(self, appraisal):
        total = 0

        for unit in appraisal.units:
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

        if appraisal.stabilizedStatementInputs.managementExpenseMode == 'income_statement':
            for expense in appraisal.incomeStatement.expenses:
                if expense.incomeStatementItemType == 'management_expense':
                    total += self.getLatestAmount(expense)
        elif appraisal.stabilizedStatementInputs.managementExpenseMode == 'rule':
            total = (appraisal.stabilizedStatementInputs.managementExpenseCalculationRule.percentage / 100.0) * self.getCalculationField(appraisal, appraisal.stabilizedStatementInputs.managementExpenseCalculationRule.field)

        return total

    def getCalculationField(self, appraisal, name):
        if name == "operatingExpenses":
            return self.computeTotalOperatingExpenses(appraisal)
        if name == "managementExpenses":
            return self.computeManagementFees(appraisal)
        if name == "taxes":
            return self.computeTaxes(appraisal)
        if name == "rentalIncome":
            return self.computeRentalIncome(appraisal)
        if name == "effectiveGrossIncome":
            return self.computeEffectiveGrossIncome(appraisal)

        if name == "operatingExpensesAndTaxes":
            return self.computeTotalOperatingExpenses(appraisal) + self.computeTaxes(appraisal)

        for expense in appraisal.incomeStatement.expenses:
            if expense.name == name:
                return expense.getLatestAmount()

    def recoveryStructureForUnit(self, appraisal, unit):
        if unit.currentTenancy and unit.currentTenancy.recoveryStructure and self.getRecoveryStructure(appraisal, unit.currentTenancy.recoveryStructure) is not None:
            recoveryStructure = self.getRecoveryStructure(appraisal, unit.currentTenancy.recoveryStructure)
        else:
            recoveryStructure = self.getDefaultRecoveryStructure(appraisal)

        return recoveryStructure


    def computeManagementRecoveriesForUnit(self, appraisal, unit):
        recoveryStructure = self.recoveryStructureForUnit(appraisal, unit)

        unit.calculatedManagementRecovery = 0

        # TODO: This is a weird edge case. Because effectiveGrossIncome is itself dependent upon management recoveries, if management recoveries are based on
        # management expenses and management expenses are based on a number that is dependent upon management recoveries, we have a circular logic that leads
        # to infinite recursion and an unsolvable set of rules. We'll need a better way to catch this in the future.
        if recoveryStructure.managementCalculationRule.field == 'managementExpenses' and \
                appraisal.stabilizedStatementInputs.managementExpenseMode == 'rule' and \
                appraisal.stabilizedStatementInputs.managementExpenseCalculationRule.field == 'effectiveGrossIncome':
            return 0

        if recoveryStructure.managementCalculationRule and recoveryStructure.managementCalculationRule.percentage and recoveryStructure.managementCalculationRule.field:
            percentage = (recoveryStructure.managementCalculationRule.percentage / 100.0)

            if unit.squareFootage and appraisal.sizeOfBuilding:
                percentage *= unit.squareFootage / appraisal.sizeOfBuilding

            recoveredAmount = percentage * self.getCalculationField(appraisal, recoveryStructure.managementCalculationRule.field)

            unit.calculatedManagementRecovery += recoveredAmount

            return recoveredAmount
        return 0



    def computeOperatingExpenseRecoveriesForUnit(self, appraisal, unit):
        recoveryStructure = self.recoveryStructureForUnit(appraisal, unit)

        unit.calculatedExpenseRecovery = 0

        for expense in appraisal.incomeStatement.expenses:
            if expense.incomeStatementItemType == 'operating_expense':
                percentage = (recoveryStructure.expenseRecoveries.get(expense.name, 100)) / 100.0

                if unit.squareFootage and appraisal.sizeOfBuilding:
                    percentage *= unit.squareFootage / appraisal.sizeOfBuilding

                recoveredAmount = percentage * expense.getLatestAmount()

                unit.calculatedExpenseRecovery += recoveredAmount

        return unit.calculatedExpenseRecovery


    def computeTaxRecoveriesForUnit(self, appraisal, unit):
        recoveryStructure = self.recoveryStructureForUnit(appraisal, unit)

        unit.calculatedTaxRecovery = 0

        for expense in appraisal.incomeStatement.expenses:
            if expense.incomeStatementItemType == 'taxes':
                percentage = (recoveryStructure.taxRecoveries.get(expense.name, 100)) / 100.0

                if unit.squareFootage and appraisal.sizeOfBuilding:
                    percentage *= unit.squareFootage / appraisal.sizeOfBuilding

                recoveredAmount = percentage * expense.getLatestAmount()

                unit.calculatedTaxRecovery += recoveredAmount

        return unit.calculatedTaxRecovery


    def computeManagementRecoveries(self, appraisal):
        total = 0

        for recoveryStructure in appraisal.recoveryStructures:
            recoveryStructure.calculatedManagementRecovery = 0
            recoveryStructure.calculatedManagementRecoveryBaseFieldValue = self.getCalculationField(appraisal, recoveryStructure.managementCalculationRule.field)

        for unit in appraisal.units:
            unit.calculatedManagementRecovery = self.computeManagementRecoveriesForUnit(appraisal, unit)

            recoveryStructure = self.recoveryStructureForUnit(appraisal, unit)

            total += unit.calculatedManagementRecovery
            recoveryStructure.calculatedManagementRecovery += unit.calculatedManagementRecovery

        return total


    def computeOperatingExpenseRecoveries(self, appraisal):
        total = 0

        for recoveryStructure in appraisal.recoveryStructures:
            recoveryStructure.calculatedExpenseRecoveries = {}
            for expense in appraisal.incomeStatement.expenses:
                if expense.incomeStatementItemType == 'operating_expense':
                    recoveryStructure.calculatedExpenseRecoveries[expense.name] = 0

        for unit in appraisal.units:
            recoveryStructure = self.recoveryStructureForUnit(appraisal, unit)

            unit.calculatedExpenseRecovery = 0

            for expense in appraisal.incomeStatement.expenses:
                if expense.incomeStatementItemType == 'operating_expense':
                    percentage = (recoveryStructure.expenseRecoveries.get(expense.name, 100)) / 100.0

                    if unit.squareFootage and appraisal.sizeOfBuilding:
                        percentage *= unit.squareFootage / appraisal.sizeOfBuilding

                    recoveredAmount = percentage * expense.getLatestAmount()

                    total += recoveredAmount
                    recoveryStructure.calculatedExpenseRecoveries[expense.name.replace(".", "").replace("$", "")] += recoveredAmount
                    unit.calculatedExpenseRecovery += recoveredAmount

        return total


    def computeTaxRecoveries(self, appraisal):
        total = 0

        for recoveryStructure in appraisal.recoveryStructures:
            recoveryStructure.calculatedTaxRecoveries = {}
            for expense in appraisal.incomeStatement.expenses:
                if expense.incomeStatementItemType == 'taxes':
                    recoveryStructure.calculatedTaxRecoveries[expense.name] = 0

        for unit in appraisal.units:
            recoveryStructure = self.recoveryStructureForUnit(appraisal, unit)

            unit.calculatedTaxRecovery = 0

            for expense in appraisal.incomeStatement.expenses:
                if expense.incomeStatementItemType == 'taxes':
                    percentage = (recoveryStructure.taxRecoveries.get(expense.name, 100)) / 100.0

                    if unit.squareFootage and appraisal.sizeOfBuilding:
                        percentage *= unit.squareFootage / appraisal.sizeOfBuilding

                    recoveredAmount = percentage * expense.getLatestAmount()

                    total += recoveredAmount
                    recoveryStructure.calculatedTaxRecoveries[expense.name.replace(".", "").replace("$", "")] += recoveredAmount
                    unit.calculatedTaxRecovery += recoveredAmount

        return total

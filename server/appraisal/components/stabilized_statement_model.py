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

        statement.structuralAllowance = statement.potentialGrossIncome * (appraisal.stabilizedStatementInputs.structuralAllowancePercent / 100.0)

        if appraisal.stabilizedStatementInputs.expensesMode == 'income_statement':
            statement.totalExpenses = statement.operatingExpenses + statement.taxes + statement.managementExpenses + statement.structuralAllowance
        elif appraisal.stabilizedStatementInputs.expensesMode == 'tmi':
            statement.totalExpenses = statement.tmiTotal + statement.structuralAllowance
        else:
            statement.totalExpenses = 0

        statement.netOperatingIncome = statement.effectiveGrossIncome - statement.totalExpenses

        statement.capitalization = statement.netOperatingIncome / (appraisal.stabilizedStatementInputs.capitalizationRate / 100.0)

        statement.valuation = statement.capitalization + statement.marketRentDifferential + statement.freeRentRentLoss + statement.vacantUnitLeasupCosts + statement.vacantUnitRentLoss + statement.amortizedCapitalInvestment

        for modifier in appraisal.stabilizedStatementInputs.modifiers:
            if modifier.amount:
                statement.valuation += modifier.amount

        if statement.valuation == 0:
            statement.valuationRounded = 0
        else:
            statement.valuationRounded = round(statement.valuation, -int(math.floor(math.log10(abs(statement.valuation)))) + 2) # Round to 3 significant figures

        return statement


    def computeTotalRecoverableIncome(self, appraisal):
        return self.computeManagementRecoveries(appraisal) + self.computeOperatingExpenseRecoveries(appraisal) + self.computeTaxRecoveries(appraisal)

    def computePotentialGrossIncome(self, appraisal):
        return self.computeRentalIncome(appraisal) + self.computeAdditionalIncome(appraisal) + self.computeTotalRecoverableIncome(appraisal)

    def computeVacancyDeduction(self, appraisal):
        return self.computePotentialGrossIncome(appraisal) * (appraisal.stabilizedStatementInputs.vacancyRate / 100.0)

    def computeEffectiveGrossIncome(self, appraisal):
        return self.computePotentialGrossIncome(appraisal) - self.computeVacancyDeduction(appraisal)


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

    def computeManagementRecoveries(self, appraisal):
        total = 0

        for recoveryStructure in appraisal.recoveryStructures:
            recoveryStructure.calculatedManagementRecovery = 0

        for unit in appraisal.units:
            if unit.currentTenancy and unit.currentTenancy.recoveryStructure and self.getRecoveryStructure(appraisal, unit.currentTenancy.recoveryStructure) is not None:
                recoveryStructure = self.getRecoveryStructure(appraisal, unit.currentTenancy.recoveryStructure)
            else:
                recoveryStructure = self.getDefaultRecoveryStructure(appraisal)

            unit.calculatedManagementRecovery = 0

            # TODO: This is a weird edge case. Because effectiveGrossIncome is itself dependent upon management recoveries, if management recoveries are based on
            # management expenses and management expenses are based on a number that is dependent upon management recoveries, we have a circular logic that leads
            # to infinite recursion and an unsolvable set of rules. We'll need a better way to catch this in the future.
            if recoveryStructure.managementCalculationRule.field == 'managementExpenses' and \
                    appraisal.stabilizedStatementInputs.managementExpenseMode == 'rule' and \
                    appraisal.stabilizedStatementInputs.managementExpenseCalculationRule.field == 'effectiveGrossIncome':
                continue

            if recoveryStructure.managementCalculationRule and recoveryStructure.managementCalculationRule.percentage and recoveryStructure.managementCalculationRule.field:
                percentage = (recoveryStructure.managementCalculationRule.percentage / 100.0)

                if unit.squareFootage and appraisal.sizeOfBuilding:
                    percentage *= unit.squareFootage / appraisal.sizeOfBuilding

                recoveredAmount = percentage * self.getCalculationField(appraisal, recoveryStructure.managementCalculationRule.field)

                total += recoveredAmount
                recoveryStructure.calculatedManagementRecovery += recoveredAmount
                unit.calculatedManagementRecovery += recoveredAmount

        return total

    def computeOperatingExpenseRecoveries(self, appraisal):
        total = 0

        for recoveryStructure in appraisal.recoveryStructures:
            recoveryStructure.calculatedExpenseRecoveries = {}
            for expense in appraisal.incomeStatement.expenses:
                if expense.incomeStatementItemType == 'operating_expense':
                    recoveryStructure.calculatedExpenseRecoveries[expense.name] = 0

        for unit in appraisal.units:
            if unit.currentTenancy and unit.currentTenancy.recoveryStructure and self.getRecoveryStructure(appraisal, unit.currentTenancy.recoveryStructure) is not None:
                recoveryStructure = self.getRecoveryStructure(appraisal, unit.currentTenancy.recoveryStructure)
            else:
                recoveryStructure = self.getDefaultRecoveryStructure(appraisal)

            unit.calculatedExpenseRecovery = 0

            for expense in appraisal.incomeStatement.expenses:
                if expense.incomeStatementItemType == 'operating_expense':
                    percentage = (recoveryStructure.expenseRecoveries.get(expense.name, 100)) / 100.0

                    if unit.squareFootage and appraisal.sizeOfBuilding:
                        percentage *= unit.squareFootage / appraisal.sizeOfBuilding

                    recoveredAmount = percentage * expense.getLatestAmount()

                    total += recoveredAmount
                    recoveryStructure.calculatedExpenseRecoveries[expense.name] += recoveredAmount
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
            if unit.currentTenancy and unit.currentTenancy.recoveryStructure and self.getRecoveryStructure(appraisal, unit.currentTenancy.recoveryStructure) is not None:
                recoveryStructure = self.getRecoveryStructure(appraisal, unit.currentTenancy.recoveryStructure)
            else:
                recoveryStructure = self.getDefaultRecoveryStructure(appraisal)

            unit.calculatedTaxRecovery = 0

            for expense in appraisal.incomeStatement.expenses:
                if expense.incomeStatementItemType == 'taxes':
                    percentage = (recoveryStructure.taxRecoveries.get(expense.name, 100)) / 100.0

                    if unit.squareFootage and appraisal.sizeOfBuilding:
                        percentage *= unit.squareFootage / appraisal.sizeOfBuilding

                    recoveredAmount = percentage * expense.getLatestAmount()

                    total += recoveredAmount
                    recoveryStructure.calculatedTaxRecoveries[expense.name] += recoveredAmount
                    unit.calculatedTaxRecovery += recoveredAmount

        return total

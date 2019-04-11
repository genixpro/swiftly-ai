from .data_extractor import  DataExtractor
from ..models.unit import Unit, Tenancy
import dateparser
import re
from ..models.income_statement import IncomeStatement, IncomeStatementItem
from pprint import pprint
import json

class IncomeStatementDataExtractor(DataExtractor):
    """ This class is for extracting income statement information from documents. """

    def __init__(self):
        pass


    def extractIncomeStatement(self, document):
        items = self.extractIncomeStatementItems(document)

        incomeStatement = IncomeStatement()

        incomeStatement.incomes = []
        incomeStatement.expenses = []

        years = set()
        yearTypes = {}
        for item in items:
            if item.cashFlowType == 'income':
                incomeStatement.incomes.append(item)
            elif item.cashFlowType == 'expense':
                incomeStatement.expenses.append(item)

            years = years.union(item.yearlyAmounts.keys())
            for year, yearType in item.yearlySourceTypes.items():
                yearTypes[year] = yearType

        incomeStatement.years = sorted([int(year) for year in years])
        incomeStatement.yearlySourceTypes = yearTypes

        return incomeStatement


    def mergeIncomeStatementItems(self, items):
        toRemove = []
        for item in items:
            if item not in toRemove:
                for item2 in items:
                    if item.name == item2.name and id(item) != id(item2):
                        item.mergeWithIncomeStatementItem(item2)
                        toRemove.append(item2)

        for item in toRemove:
            items.remove(item)

        return items

    def extractIncomeStatementItems(self, document):
        incomeStatementItems = []

        lineItems = document.getLineItems("operating_statement")
        year = int(document.getDocumentYear())

        for lineItem in lineItems:
            if 'SUM' in lineItem['modifiers'] and 'SUMMARY' not in lineItem['modifiers']:

                if 'NEXT_YEAR' in lineItem['modifiers']:
                    item = self.createIncomeStatementObject(lineItem, year + 1)
                elif 'PREVIOUS_YEAR' in lineItem['modifiers']:
                    item = self.createIncomeStatementObject(lineItem, year - 1)
                else:
                    item = self.createIncomeStatementObject(lineItem, year)

                incomeStatementItems.append(item)

        return self.mergeIncomeStatementItems(incomeStatementItems)

    def createIncomeStatementObject(self, lineItem, year):
        incomeStatementItem = IncomeStatementItem()

        incomeStatementItem.name = lineItem.get('ACC_NAME', '')

        if 'FORECAST' in lineItem:
            incomeStatementItem.yearlyAmounts = {str(year): self.cleanAmount(lineItem.get("FORECAST", "0"))}
            incomeStatementItem.extractionReferences = {str(year): lineItem.get("FORECAST_reference", None)}
            incomeStatementItem.yearlySourceTypes = {str(year): 'actual'}
        elif 'BUDGET' in lineItem:
            incomeStatementItem.yearlyAmounts = {str(year): self.cleanAmount(lineItem.get("BUDGET", "0"))}
            incomeStatementItem.extractionReferences = {str(year): lineItem.get("BUDGET_reference", None)}
            incomeStatementItem.yearlySourceTypes = {str(year): 'budget'}

        if 'INCOME' in lineItem['modifiers']:
            incomeStatementItem.cashFlowType = 'income'
        elif 'EXPENSE' in lineItem['modifiers']:
            incomeStatementItem.cashFlowType = 'expense'

        if 'RENT' in lineItem['modifiers']:
            incomeStatementItem.incomeStatementItemType = 'rental_income'
        elif 'ADDITIONAL_INCOME' in lineItem['modifiers']:
            incomeStatementItem.incomeStatementItemType = 'additional_income'
        elif 'EXPENSE_RECOVERY' in lineItem['modifiers']:
            incomeStatementItem.incomeStatementItemType = 'expense_recovery'
        elif 'OPERATING_EXPENSE' in lineItem['modifiers']:
            incomeStatementItem.incomeStatementItemType = 'operating_expense'
        elif 'NON_RECOVERABLE_EXPENSE' in lineItem['modifiers']:
            incomeStatementItem.incomeStatementItemType = 'non_recoverable_expense'
        elif 'TAXES' in lineItem['modifiers']:
            incomeStatementItem.incomeStatementItemType = 'taxes'
        elif 'MANAGEMENT_EXPENSE' in lineItem['modifiers']:
            incomeStatementItem.incomeStatementItemType = 'management_expense'
        elif 'STRUCTURAL_ALLOWANCE' in lineItem['modifiers']:
            incomeStatementItem.incomeStatementItemType = 'structural_allowance'
        else:
            incomeStatementItem.incomeStatementItemType = 'unknown'

        return incomeStatementItem




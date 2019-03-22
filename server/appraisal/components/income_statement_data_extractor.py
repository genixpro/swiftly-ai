from .data_extractor import  DataExtractor
from ..models.unit import Unit, Tenancy
import dateparser
import re
from ..models.income_statement import IncomeStatement, IncomeStatementItem
from pprint import pprint

class IncomeStatementDataExtractor (DataExtractor):
    """ This class is for extracting income statement information from documents. """

    def __init__(self):
        pass


    def extractIncomeStatement(self, document):
        incomeStatement = IncomeStatement()

        items = self.extractIncomeStatementItems(document)

        incomeStatement.incomes = []
        incomeStatement.expenses = []

        for item in items:
            if item.cashFlowType == 'income':
                incomeStatement.incomes.append(item)
            elif item.cashFlowType == 'expense':
                incomeStatement.expenses.append(item)

        return incomeStatement


    def extractIncomeStatementItems(self, document):
        incomeStatementItems = []

        lineItems = document.getLineItems("operating_statement")

        for lineItem in lineItems:
            if 'SUM' in lineItem['modifiers'] and 'SUMMARY' not in lineItem['modifiers'] and 'NEXT_YEAR' not in lineItem['modifiers']:
                incomeStatementItems.append(self.createIncomeStatementObject(lineItem))

        return incomeStatementItems

    def createIncomeStatementObject(self, lineItem):
        incomeStatementItem = IncomeStatementItem()

        incomeStatementItem.name = lineItem.get('ACC_NAME', '')

        incomeStatementItem.yearlyAmount = self.cleanAmount(lineItem.get("BUDGET", "0"))
        incomeStatementItem.monthlyAmount = incomeStatementItem.yearlyAmount / 12.0

        if 'INCOME' in lineItem['modifiers']:
            incomeStatementItem.cashFlowType = 'income'
        elif 'EXPENSE' in lineItem['modifiers']:
            incomeStatementItem.cashFlowType = 'expense'

        return incomeStatementItem




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
            if item.type == 'income':
                incomeStatement.incomes.append(item)
            elif item.type == 'expense':
                incomeStatement.expenses.append(item)

        return incomeStatement


    def extractIncomeStatementItems(self, document):
        incomeStatementItems = []

        lineItems = document.getLineItems("operating_statement")

        pprint(lineItems)

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
            incomeStatementItem.type = 'income'
        elif 'EXPENSE' in lineItem['modifiers']:
            incomeStatementItem.type = 'expense'

        return incomeStatementItem



    # def getYearlyCashFlows(self, document):
    #     cashFlows = self.getMonthlyCashFlows(document)
    #
    #
    #     cashFlowGroups = {}
    #     for cashFlow in cashFlows:
    #         groupId = (cashFlow['name'], cashFlow['year'])
    #         if groupId in cashFlowGroups:
    #             cashFlowGroups[groupId].append(cashFlow)
    #         else:
    #             cashFlowGroups[groupId] = [cashFlow]
    #
    #     yearlyCashFlows = []
    #     for monthCashFlows in cashFlowGroups.values():
    #         yearlyCashFlow = {
    #             "name": monthCashFlows[0]['name'],
    #             "year": monthCashFlows[0]['year'],
    #             "type": monthCashFlows[0]['type'],
    #             "amount": float(numpy.sum([cashFlow['amount'] for cashFlow in monthCashFlows])),
    #             "presentValue": float(numpy.sum([cashFlow['amount'] for cashFlow in monthCashFlows]))
    #         }
    #         yearlyCashFlows.append(yearlyCashFlow)
    #
    #     return yearlyCashFlows


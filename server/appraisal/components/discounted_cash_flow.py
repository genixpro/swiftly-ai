from .document_extractor_dataset import DocumentExtractorDataset
import dateparser
from dateutil.relativedelta import relativedelta
import datetime
import re
import numpy
import copy
import math
from pprint import pprint
from .market_data import MarketData

class DiscountedCashFlowModel:
    """ This class encapsulated the information for a discounted cash flow model of an appraisal. """

    def __init__(self, documents, marketData, discountRate):
        """Constructs a discounted cash flow model based on the given documents"""
        self.marketData = marketData
        self.discountRate = discountRate

        cashFlows = []

        for document in documents:
            cashFlows.extend(self.getYearlyCashFlows(document))

        self.cashFlows = cashFlows
        self.cashFlowSummary = self.computeCashFlowSummary(cashFlows)

    def getCashFlows(self):
        return self.cashFlows

    def getCashFlowSummary(self):
        return self.cashFlowSummary

    def getDocumentYear(self, document):
        tokens = document.breakIntoTokens()

        date = ""
        for token in tokens:
            if token['classification'] == 'STATEMENT_YEAR':
                return token['text']
            elif token['classification'] == 'STATEMENT_DATE':
                date = token['text']

        if date == '':
            return datetime.datetime.now().year

        parsed = dateparser.parse(date)

        return parsed.year


    def getLineItems(self, document):
        tokens = document.breakIntoTokens()

        year = self.getDocumentYear(document)

        tokensByLineNumberAndPage = {}
        for token in tokens:
            if token['classification'] != "null":
                lineNumberPage = (token['words'][0]['page'], token['words'][0]['lineNumber'])
                if lineNumberPage in tokensByLineNumberAndPage:
                    tokensByLineNumberAndPage[lineNumberPage].append(token)
                else:
                    tokensByLineNumberAndPage[lineNumberPage] = [token]

        lineItems = []

        for lineNumberPage in tokensByLineNumberAndPage:
            groupedByClassification = {}
            for token in tokensByLineNumberAndPage[lineNumberPage]:
                if token['classification'] in groupedByClassification:
                    groupedByClassification[token['classification']].append(token)
                else:
                    groupedByClassification[token['classification']] = [token]

            maxSize = max([len(groupedByClassification[classification]) for classification in groupedByClassification])

            items = [{
                'modifiers': set()
            } for n in range(maxSize)]
            for classification in groupedByClassification:
                for tokenIndex, token in enumerate(groupedByClassification[classification]):
                    if len(groupedByClassification[classification]) == 1:
                        itemsForGroup = items
                    else:
                        itemsForGroup = [items[tokenIndex]]

                    for item in itemsForGroup:
                        item[token['classification']] = token['text']
                        for modifier in token['modifiers']:
                            item['modifiers'].add(modifier)

            for item in items:
                if 'NEXT_YEAR' in item['modifiers']:
                    item['year'] = year + 1
                else:
                    item['year'] = year

            lineItems.extend(items)

        return lineItems

    def getCleanedAmount(self, amount):
        negative = False
        if "-" in amount or "(" in amount:
            negative = True

        amount = re.sub("[^0-9\\.]", "", amount)

        if amount == '':
            return 0

        number = float(amount)

        if negative:
            return -number
        else:
            return number



    def projectCashFlows(self, lineItem, startYear, endYear):
        # We project cash flows for an item on the statement by increasing by inflation
        amount = self.getCleanedAmount(lineItem.get("BUDGET", "0")) / 12

        startDate = datetime.datetime(year=startYear, month=1, day=1, hour=0, minute=0, second=0)
        endDate = datetime.datetime(year=endYear, month=12, day=1, hour=0, minute=0, second=0)

        currentDate = copy.copy(startDate)

        monthlyInflation = math.pow(1.0 + (self.marketData.inflation) / 100, 1 / 12.0)

        cashFlows = []

        itemType = ""
        if 'INCOME' in lineItem['modifiers']:
            itemType = 'income'
        elif 'EXPENSE' in lineItem['modifiers']:
            itemType = 'expense'

        month = 0
        while currentDate < endDate:
            totalInflation = monthlyInflation ** month

            startYear += 1

            cashFlows.append({
                "name": lineItem.get('ACC_NAME', ''),
                "amount": amount * totalInflation,
                "type": itemType,
                "year": currentDate.year,
                "month": currentDate.month,
                "relativeMonth": month
            })

            currentDate = currentDate + relativedelta(months=1)
            month += 1

        return cashFlows


    def discountCashFlows(self, cashFlows):
        monthlyDiscount = math.pow(1.0 + (self.discountRate) / 100, 1 / 12.0)

        for cashFlow in cashFlows:
            totalDiscount = monthlyDiscount ** cashFlow['relativeMonth']
            presentValue = cashFlow['amount'] * totalDiscount
            cashFlow['presentValue'] = presentValue



    def getMonthlyCashFlows(self, document):
        cashFlows = []

        lineItems = self.getLineItems(document)

        presentValue = 0

        documentYear = self.getDocumentYear(document)

        for lineItem in lineItems:
            if 'SUM' in lineItem['modifiers'] and 'SUMMARY' not in lineItem['modifiers']:
                cashFlows.extend(self.projectCashFlows(lineItem, documentYear, documentYear + 10))


        self.discountCashFlows(cashFlows)

        return cashFlows


    def getYearlyCashFlows(self, document):
        cashFlows = self.getMonthlyCashFlows(document)


        cashFlowGroups = {}
        for cashFlow in cashFlows:
            groupId = (cashFlow['name'], cashFlow['year'])
            if groupId in cashFlowGroups:
                cashFlowGroups[groupId].append(cashFlow)
            else:
                cashFlowGroups[groupId] = [cashFlow]

        yearlyCashFlows = []
        for monthCashFlows in cashFlowGroups.values():
            yearlyCashFlow = {
                "name": monthCashFlows[0]['name'],
                "year": monthCashFlows[0]['year'],
                "type": monthCashFlows[0]['type'],
                "amount": float(numpy.sum([cashFlow['amount'] for cashFlow in monthCashFlows])),
                "presentValue": float(numpy.sum([cashFlow['amount'] for cashFlow in monthCashFlows]))
            }
            yearlyCashFlows.append(yearlyCashFlow)

        return yearlyCashFlows

    def computeCashFlowSummary(self, yearlyCashFlows):
        years = sorted(set(cashFlow['year'] for cashFlow in yearlyCashFlows))

        # Group incomes and expenses by name
        incomeGrouped = {}
        expenseGrouped = {}
        for cashFlow in yearlyCashFlows:
            if cashFlow['type'] == 'income':
                grouped = incomeGrouped
            elif cashFlow['type'] == 'expense':
                grouped = expenseGrouped
            else:
                continue

            if cashFlow['name'] in grouped:
                grouped[cashFlow['name']].append(cashFlow)
            else:
                grouped[cashFlow['name']] = [cashFlow]

        incomeTotalsByYear = {}
        expenseTotalsByYear = {}

        for cashFlows in incomeGrouped.values():
            for cashFlow in cashFlows:
                year = cashFlow['year']
                if year in incomeTotalsByYear:
                    incomeTotalsByYear[year] += cashFlow['amount']
                else:
                    incomeTotalsByYear[year] = cashFlow['amount']

        for cashFlows in expenseGrouped.values():
            for cashFlow in cashFlows:
                year = cashFlow['year']
                if year in expenseTotalsByYear:
                    expenseTotalsByYear[year] += cashFlow['amount']
                else:
                    expenseTotalsByYear[year] = cashFlow['amount']

        # Compute net operating income
        operatingIncomeByYear = {}
        for year in years:
            operatingIncomeByYear[year] = incomeTotalsByYear[year] - expenseTotalsByYear[year]


        # Compute present value by year
        yearlyDiscount = 1.0 + (self.discountRate) / 100.0
        presentValueByYear = {}
        startYear = years[0]
        for year in years:
            discountRate = yearlyDiscount ** (year - startYear)
            presentValueByYear[year] = operatingIncomeByYear[year] / discountRate


        return {
            "years": years,
            "income": incomeTotalsByYear,
            "expense": expenseTotalsByYear,
            "netOperatingIncome": operatingIncomeByYear,
            "presentValue": presentValueByYear
        }






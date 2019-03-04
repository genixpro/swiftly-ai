from .document_extractor_dataset import DocumentExtractorDataset
import dateparser
from dateutil.relativedelta import relativedelta
import datetime
import re
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
            cashFlows.extend(self.getCashFlows(document))

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

        tokensByLineNumber = {}
        for token in tokens:
            if token['classification'] != "null":
                lineNumber = token['words'][0]['lineNumber']
                if lineNumber in tokensByLineNumber:
                    tokensByLineNumber[lineNumber].append(token)
                else:
                    tokensByLineNumber[lineNumber] = [token]

        lineItems = []

        for lineNumber in tokensByLineNumber:
            groupedByClassification = {}
            for token in tokensByLineNumber[lineNumber]:
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

        amount = re.sub("[^0-9\\.]", "")
        number = float(amount)

        if negative:
            return -number
        else:
            return number



    def projectCashFlows(self, lineItem, startYear, endYear):
        # We project cash flows for an item on the statement by increasing by inflation

        amount = self.getCleanedAmount(lineItem.get("FORECAST", "0"))

        startDate = datetime.datetime(year=startYear, month=0, day=0, hour=0, minute=0, second=0)
        endDate = datetime.datetime(year=endYear, month=11, day=0, hour=0, minute=0, second=0)

        currentDate = datetime.datetime(startDate)

        monthlyInflation = math.pow(1.0 + (self.marketData.inflation) / 100, 1 / 12.0)

        cashFlows = []

        month = 0
        while currentDate < endDate:
            totalInflation = monthlyInflation ** month

            startYear += 1

            cashFlows.append({
                "amount": amount * totalInflation,
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



    def getCashFlows(self, document):
        cashFlows = []

        lineItems = self.getLineItems(document)

        presentValue = 0

        for lineItem in lineItems:
            if 'INCOME' in lineItem['modifiers']:
                cashFlows.extend(self.projectCashFlows(lineItem))











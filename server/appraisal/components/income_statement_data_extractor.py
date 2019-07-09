from appraisal.components.data_extractor import  DataExtractor
from appraisal.models.unit import Unit, Tenancy
import dateparser
import re
import datetime
from appraisal.models.income_statement import IncomeStatement, IncomeStatementItem
from appraisal.models.extraction_reference import ExtractionReference
from pprint import pprint
import rapidjson as json

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

        # pprint(json.loads(incomeStatement.to_json()))

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

    def yearFromModifiers(self, documentYear, modifiers):
        if 'NEXT_YEAR' in modifiers:
            return documentYear + 1
        elif 'NEXT_YEAR' in modifiers:
            return documentYear + 2
        elif 'PREVIOUS_YEAR' in modifiers:
            return documentYear - 1
        elif 'PREVIOUS_YEAR_2' in modifiers:
            return documentYear - 2
        elif 'PREVIOUS_YEAR_3' in modifiers:
            return documentYear - 3
        elif 'PREVIOUS_YEAR_4' in modifiers:
            return documentYear - 4
        else:
            return documentYear


    def itemAmountKey(self, classification, modifiers):
        """ Provides the a unique key which identifies the key attributes of a given amount"""
        keyModifiers = [
            "NEXT_YEAR",
            "NEXT_YEAR_2",
            "PREVIOUS_YEAR",
            "PREVIOUS_YEAR_2",
            "PREVIOUS_YEAR_3",
            "PREVIOUS_YEAR_4",
            "PERCENTAGE",
            "PSF"
        ]

        relevantModifiers = sorted([modifier for modifier in modifiers if modifier in keyModifiers])

        return (classification, tuple(relevantModifiers))

    def chooseItemAmountKeyForYear(self, itemAmountKeys, documentYear, relevantYear):
        filteredKeys = [key for key in itemAmountKeys if 'PERCENTAGE' not in key[1] and 'PSF' not in key[1]]

        if documentYear == relevantYear:
            filteredKeys = [key for key in filteredKeys if len(key[1]) == 0]
        elif (documentYear + 1) == relevantYear:
            filteredKeys = [key for key in filteredKeys if 'NEXT_YEAR' in key[1]]
        elif (documentYear + 2) == relevantYear:
            filteredKeys = [key for key in filteredKeys if 'NEXT_YEAR_2' in key[1]]
        elif (documentYear - 1) == relevantYear:
            filteredKeys = [key for key in filteredKeys if 'PREVIOUS_YEAR' in key[1]]
        elif (documentYear - 2) == relevantYear:
            filteredKeys = [key for key in filteredKeys if 'PREVIOUS_YEAR_2' in key[1]]
        elif (documentYear - 3) == relevantYear:
            filteredKeys = [key for key in filteredKeys if 'PREVIOUS_YEAR_3' in key[1]]
        elif (documentYear - 4) == relevantYear:
            filteredKeys = [key for key in filteredKeys if 'PREVIOUS_YEAR_3' in key[1]]

        for key in filteredKeys:
            if key[0] == 'ACTUALS':
                return key

        for key in filteredKeys:
            if key[0] == 'FORECAST':
                return key

        for key in filteredKeys:
            if key[0] == 'YEAR_TO_DATE':
                return key

        return None


    def incomeTypeKeyFromModifiers(self, modifiers):
        """ Provides the a unique key describing the income type assigned to a given line item."""
        keyModifiers = [
            "INCOME",
            "EXPENSE",
            "RENT",
            "ADDITIONAL_INCOME",
            "EXPENSE_RECOVERY",
            "OPERATING_EXPENSE",
            "NON_RECOVERABLE_EXPENSE",
            "TAXES",
            "MANAGEMENT_EXPENSE",
            "STRUCTURAL_ALLOWANCE"
        ]

        relevantModifiers = sorted([modifier for modifier in modifiers if modifier in keyModifiers])

        return tuple(relevantModifiers)

    def cashFlowTypeFromModifiers(self, modifiers):
        """ Provides the a unique key describing the income type assigned to a given line item."""
        if 'INCOME' in modifiers:
            return 'income'
        elif 'EXPENSE' in modifiers:
            return 'expense'
        else:
            return None

    def incomeStatementItemTypeFromModifiers(self, modifiers):
        """ Provides the a unique key describing the income type assigned to a given line item."""
        if 'RENT' in modifiers:
            return 'rental_income'
        elif 'ADDITIONAL_INCOME' in modifiers:
            return 'additional_income'
        elif 'EXPENSE_RECOVERY' in modifiers:
            return 'expense_recovery'
        elif 'OPERATING_EXPENSE' in modifiers:
            return 'operating_expense'
        elif 'NON_RECOVERABLE_EXPENSE' in modifiers:
            return 'non_recoverable_expense'
        elif 'TAXES' in modifiers:
            return 'taxes'
        elif 'MANAGEMENT_EXPENSE' in modifiers:
            return 'management_expense'
        elif 'STRUCTURAL_ALLOWANCE' in modifiers:
            return 'structural_allowance'
        else:
            return 'unknown'

    def yearlySourceTypeFromClassification(self, classification):
        """ Provides the yearly source type based on the modifiers"""
        if classification == 'ACTUALS':
            return 'actual'
        elif classification == 'FORECAST':
            return 'budget'
        elif classification == 'YEAR_TO_DATE':
            return 'year_to_date'

        return ''

    def getDocumentYear(self, document):
        tokens = document.breakIntoTokens()

        date = ""
        for token in tokens:
            if token['classification'] == 'STATEMENT_YEAR':
                return self.cleanAmount(token['text'])
            elif token['classification'] == 'STATEMENT_DATE':
                date = token['text']

        if date == '':
            try:
                return int(datetime.datetime.now().year)
            except ValueError:
                pass

        parsed = dateparser.parse(date)

        return int(float(parsed.year))

    def extractIncomeStatementItems(self, document):
        documentYear = int(self.getDocumentYear(document))

        # First, we will sort all the extracted data into lines.
        lines = {}
        tokens = document.breakIntoTokens()

        dataTypes = [
            'INCOME_STATEMENT',
            'EXPENSE_STATEMENT'
        ]

        for token in tokens:
            documentLineNumber = token['words'][0].documentLineNumber

            if token['words'][0].groups.get('DATA_TYPE', None) in dataTypes:
                if documentLineNumber in lines:
                    lines[documentLineNumber].append(token)
                else:
                    lines[documentLineNumber] = [token]

        # We also go through and build up a complete list of the various sorts of amounts that exist on this income statement. They are identified
        # by their item-amount-key. This allows us to smoothly handle cases where there was no value in a given column & row, which implies a 0 for
        # that value
        itemAmountKeys = set()
        for token in tokens:
            if token['classification'] in ['FORECAST', 'ACTUALS', 'YEAR_TO_DATE', 'VARIANCE']:
                itemAmountKeys.add(self.itemAmountKey(token['classification'], token['modifiers']))

        # We go through every token and also accumulate all of the known years
        years = set()
        for token in tokens:
            if token['classification'] in ['FORECAST', 'ACTUALS', 'YEAR_TO_DATE', 'VARIANCE']:
                tokenYear = self.yearFromModifiers(documentYear, token['modifiers'])
                years.add(tokenYear)

        # Now we go line by line, and we create an intermediate object describing that line.
        linesProcessed = []
        for lineNumber, lineTokens in lines.items():
            lineInfo = {
                'modifiers': set(),
                'groups': lineTokens[0]['groups'],
                'groupNumbers': lineTokens[0]['groupNumbers']
            }
            for token in lineTokens:
                if token['classification'] == 'ACC_NAME':
                    lineInfo['name'] = token['text']
                elif token['classification'] in ['FORECAST', 'ACTUALS', 'YEAR_TO_DATE', 'VARIANCE']:
                    lineInfo[self.itemAmountKey(token['classification'], token['modifiers'])] = token['text']
                    lineInfo[(self.itemAmountKey(token['classification'], token['modifiers']), 'token')] = token

                for modifier in token['modifiers']:
                    lineInfo['modifiers'].add(modifier)

            for key in itemAmountKeys:
                if key not in lineInfo:
                    lineInfo[key] = "0"

            linesProcessed.append(lineInfo)

        # Now we go through the processed lines and assign them to either grouped or ungrouped, depending on whether they are within a line item sum-group
        lineItemGroups = {}
        ungroupedLines = []
        for line in linesProcessed:
            if line['groups'].get('ITEMS', None) == 'LINE_ITEM_GROUP_WITH_SUM':
                groupNumber = line['groupNumbers']['ITEMS']

                if groupNumber in lineItemGroups:
                    lineItemGroups[groupNumber].append(line)
                else:
                    lineItemGroups[groupNumber] = [line]
            else:
                ungroupedLines.append(line)

        # Now we have to determine which lines actually get their numbers extracted
        extractionLines = []

        # For grouped lines, check to see whether the expense type key is exactly the same on all of them. If so, we take the sum. If not, we break
        # apart the separate line items
        for groupNumber, groupLines in lineItemGroups.items():
            incomeTypes = set([self.incomeTypeKeyFromModifiers(line['modifiers']) for line in groupLines])

            if len(incomeTypes) == 1:
                # Find the sum and take that number
                sumLine = None
                for line in groupLines:
                    if 'SUM' in line['modifiers']:
                        sumLine = line
                if sumLine is not None:
                    extractionLines.append(sumLine)
            else:
                # Add in the individual line-items, excluding the sum
                for line in groupLines:
                    if 'SUM' not in line['modifiers']:
                        extractionLines.append(line)

        # Now we go through ungrouped lines. Anything not marked as "SUMMARY" as an individual line item will get extracted
        for line in ungroupedLines:
            if 'SUMMARY' not in line['modifiers']:
                extractionLines.append(line)

        # Finally, we create the income statement item objects from each line marked for extraction.
        incomeStatementItems = []
        for lineItem in extractionLines:
            incomeStatementItem = IncomeStatementItem()
            incomeStatementItem.name = lineItem.get('name', '')
            incomeStatementItem.cashFlowType = self.cashFlowTypeFromModifiers(lineItem['modifiers'])
            incomeStatementItem.incomeStatementItemType = self.incomeStatementItemTypeFromModifiers(lineItem['modifiers'])

            for lineYear in years:
                # For each year, we take the highest priority item
                chosenKey = self.chooseItemAmountKeyForYear(itemAmountKeys, documentYear, lineYear)

                if chosenKey is not None and chosenKey in lineItem:
                    incomeStatementItem.yearlyAmounts[str(lineYear)] = self.cleanAmount(lineItem[chosenKey])
                    if (chosenKey, 'token') in lineItem:
                        incomeStatementItem.extractionReferences[str(lineYear)] = ExtractionReference(fileId=str(document.id), appraisalId=str(document.appraisalId), wordIndexes=[word['index'] for word in lineItem[(chosenKey, 'token')]['words']])
                    incomeStatementItem.yearlySourceTypes[str(lineYear)] = self.yearlySourceTypeFromClassification(chosenKey[0])
                else:
                    incomeStatementItem.yearlyAmounts[str(lineYear)] = 0
                    incomeStatementItem.extractionReferences[str(lineYear)] = None
                    incomeStatementItem.yearlySourceTypes[str(lineYear)] = ''

            # print(incomeStatementItem.yearlySourceTypes)
            incomeStatementItems.append(incomeStatementItem)

        return incomeStatementItems

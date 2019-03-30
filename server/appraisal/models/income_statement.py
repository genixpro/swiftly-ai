from mongoengine import *
import datetime
from .extraction_reference import ExtractionReference


class IncomeStatementItem(EmbeddedDocument):
    meta = {'strict': False}

    # The name of the income statement item
    name = StringField()

    # The yearly amount of this income statement item
    yearlyAmounts = DictField(FloatField())

    # The references to the original files that this data point was pulled from, by year.
    extractionReferences = DictField()

    # Whether the income statement item is an income or an expense
    cashFlowType = StringField()

    def getLatestAmount(self):
        years = sorted(self.yearlyAmounts.keys(), key=lambda x: float(x))
        return self.yearlyAmounts[years[-1]]

    def mergeWithIncomeStatementItem(self, otherIncomeStatementItem):
        for year in otherIncomeStatementItem.yearlyAmounts.keys():
            if year not in self.yearlyAmounts:
                self.yearlyAmounts[year] = otherIncomeStatementItem.yearlyAmounts[year]
                self.extractionReferences[year] = otherIncomeStatementItem.extractionReferences[year]




class IncomeStatement(EmbeddedDocument):
    years = ListField(IntField())

    incomes = ListField(EmbeddedDocumentField(IncomeStatementItem))

    expenses = ListField(EmbeddedDocumentField(IncomeStatementItem))

    def mergeWithIncomeStatement(self, otherIncomeStatement):
        for otherIncome in otherIncomeStatement.incomes:
            found = False
            for income in self.incomes:
                if income.name == otherIncome.name:
                    income.mergeWithIncomeStatementItem(otherIncome)
                    found = True

            if found == False:
                self.incomes.append(otherIncome)

        for otherExpense in otherIncomeStatement.expenses:
            found = False
            for expense in self.expenses:
                if expense.name == otherExpense.name:
                    expense.mergeWithIncomeStatementItem(otherExpense)
                    found = True

            if found == False:
                self.expenses.append(otherExpense)

        self.years = sorted(list(set(self.years).union(set(otherIncomeStatement.years))))

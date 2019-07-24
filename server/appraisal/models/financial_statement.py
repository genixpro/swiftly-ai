from mongoengine import *
import datetime
from appraisal.models.extraction_reference import ExtractionReference


class FinancialStatementItem(EmbeddedDocument):
    meta = {'strict': False}

    # The name of the income statement item
    name = StringField()

    # The yearly amount of this income statement item
    yearlyAmounts = DictField(FloatField())

    # This is the source type for each of the yearly amounts
    yearlySourceTypes = DictField(StringField(choices=['actual', 'budget', 'user', 'year_to_date', ''], null=True))

    # The references to the original files that this data point was pulled from, by year.
    extractionReferences = DictField()

    # Whether the income statement item is an income or an expense
    cashFlowType = StringField(choices=["income", "expense"])

    # This specifies the income item type, which breaks incomes and expenses into various categories
    incomeStatementItemType = StringField(choices=[
        "",
        "rental_income",
        "additional_income",
        "expense_recovery",
        "operating_expense",
        "non_recoverable_expense",
        "taxes",
        "management_expense",
        "structural_allowance",
        "unknown"
    ])

    @property
    def machineName(self):
        return str(self.name).replace(".", "").replace("$", "")

    def getLatestAmount(self):
        years = sorted(self.yearlyAmounts.keys(), key=lambda x: float(x))

        if len(years) == 0:
            return 0

        return self.yearlyAmounts[years[-1]]

    def mergeWithIncomeStatementItem(self, otherIncomeStatementItem):
        for year in otherIncomeStatementItem.yearlyAmounts.keys():
            if year not in self.yearlyAmounts:
                self.yearlyAmounts[year] = otherIncomeStatementItem.yearlyAmounts[year]
                self.extractionReferences[year] = otherIncomeStatementItem.extractionReferences[year]
                self.yearlySourceTypes[year] = otherIncomeStatementItem.yearlySourceTypes[year]




class FinancialStatement(EmbeddedDocument):
    years = ListField(IntField(), default=[])

    yearlySourceTypes = DictField(StringField(), default={})

    customYearTitles = DictField(StringField(), default={})

    # DEPRECATED
    incomes = ListField(EmbeddedDocumentField(FinancialStatementItem))

    # DEPRECATED
    expenses = ListField(EmbeddedDocumentField(FinancialStatementItem))

    items = ListField(EmbeddedDocumentField(FinancialStatementItem))

    def mergeWithIncomeStatement(self, otherIncomeStatement):
        for otherItem in otherIncomeStatement.items:
            found = False
            for item in self.items:
                if item.name == otherItem.name:
                    item.mergeWithIncomeStatementItem(otherItem)
                    found = True

            if found == False:
                self.items.append(otherItem)

        self.years = sorted(list(set(self.years).union(set(otherIncomeStatement.years))))
        self.yearlySourceTypes = {}
        for year in otherIncomeStatement.yearlySourceTypes:
            if year not in self.yearlySourceTypes:
                self.yearlySourceTypes[year] = otherIncomeStatement.yearlySourceTypes[year]


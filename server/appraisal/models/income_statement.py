from mongoengine import *
import datetime



class IncomeStatementItem(EmbeddedDocument):
    # The name of the income statement item
    name = StringField()

    # The monthly amount of this income statement item
    monthlyAmount = FloatField()

    # The yearly amount of this income statement item
    yearlyAmount = FloatField()

    # Whether the income statement item is an income or an expense
    type = StringField()



class IncomeStatement(EmbeddedDocument):
    incomes = ListField(EmbeddedDocumentField(IncomeStatementItem))

    expenses = ListField(EmbeddedDocumentField(IncomeStatementItem))

    def mergeWithIncomeStatement(self, otherIncomeStatement):
        for otherIncome in otherIncomeStatement.incomes:
            found = False
            for income in self.incomes:
                if income.name == otherIncome.name:
                    found = True

            if found == False:
                self.incomes.append(otherIncome)

        for otherExpense in otherIncomeStatement.expenses:
            found = False
            for expense in self.expenses:
                if expense.name == otherExpense.name:
                    found = True

            if found == False:
                self.expenses.append(otherExpense)

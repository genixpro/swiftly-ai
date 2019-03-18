from mongoengine import *
import datetime


class MonthlyCashFlowItem(EmbeddedDocument):
    """
        This class represents a single input number in a discounted cash flow model. This an amount of cash flow
        taking place in a single month for a single item
    """
    # The name of the cash flow item
    name = StringField()

    # The year that this cash flow took place in
    year = IntField()

    # The month that this cash flow took place in
    month = IntField()

    # This is the number of the month relative to the start of the DCF model. 0 for the first month.
    relativeMonth = IntField()

    # The amount of this cash flow
    amount = FloatField()

    # A string representing the type of this cash flow,
    type = StringField()


class YearlyCashFlowItem(EmbeddedDocument):
    """
        This class represents the summarization of a cash flow over a year.
    """
    # The name of the cash flow item
    name = StringField()

    # The year that this cash flow took place in
    year = IntField()

    # This is the number of the year relative to the start of the DCF model. 0 for the first year.
    relativeYear = IntField()

    # The amount of this cash flow
    amount = FloatField()

    # A string representing the type of this cash flow,
    type = StringField()
    

class DiscountedCashFlowSummaryItem(EmbeddedDocument):
    """
        This class represents a single line of the summarized discounted cash flow.
    """
    # The name of the summary line
    name = StringField()

    # The amounts for this summary line for all the years
    amounts = DictField()



class DiscountedCashFlowSummary(EmbeddedDocument):
    """
        This class represents a sumarization of the discounted cash flow. It shows the various
        numbers as they change over all the years the DCF is projected for. This isn't the raw
        data and summary lines can exist for totals as well.
    """
    years = ListField(IntField())

    incomes = ListField(EmbeddedDocumentField(DiscountedCashFlowSummaryItem))
    expenses = ListField(EmbeddedDocumentField(DiscountedCashFlowSummaryItem))

    incomeTotal = EmbeddedDocumentField(DiscountedCashFlowSummaryItem)
    expenseTotal = EmbeddedDocumentField(DiscountedCashFlowSummaryItem)

    netOperatingIncome = EmbeddedDocumentField(DiscountedCashFlowSummaryItem)
    presentValue = EmbeddedDocumentField(DiscountedCashFlowSummaryItem)




class DiscountedCashFlow(EmbeddedDocument):
    yearlyCashFlows = ListField(EmbeddedDocumentField(YearlyCashFlowItem))

    cashFlowSummary = EmbeddedDocumentField(DiscountedCashFlowSummary)

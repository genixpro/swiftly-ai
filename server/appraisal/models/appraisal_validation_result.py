from mongoengine import *
import datetime
from .unit import Unit
from .income_statement import IncomeStatement
from .discounted_cash_flow import DiscountedCashFlow
from .discounted_cash_flow_inputs import DiscountedCashFlowInputs



class AppraisalValidationResult(EmbeddedDocument):
    """
        This class represents the result of running the appraisal through validation. It is used to maintain the "checklist" functionality
        on the frontend.
    """
    meta = {'strict': False}

    hasBuildingInformation = BooleanField(default=False)

    hasRentRoll = BooleanField(default=False)

    hasIncomeStatement = BooleanField(default=False)


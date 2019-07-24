from mongoengine import *
import datetime
from appraisal.models.unit import Unit
from appraisal.models.financial_statement import FinancialStatement
from appraisal.models.discounted_cash_flow import DiscountedCashFlow
from appraisal.models.discounted_cash_flow_inputs import DiscountedCashFlowInputs



class AppraisalValidationResult(EmbeddedDocument):
    """
        This class represents the result of running the appraisal through validation. It is used to maintain the "checklist" functionality
        on the frontend.
    """
    meta = {'strict': False}

    hasBuildingInformation = BooleanField(default=False)

    hasRentRoll = BooleanField(default=False)

    hasFinancialInfo = BooleanField(default=False)

    hasExpenses = BooleanField(default=False)

    hasTaxes = BooleanField(default=False)

    hasAdditionalIncome = BooleanField(default=False)

    hasAmortizations = BooleanField(default=False)

    hasEscalations = BooleanField(default=False)

    hasRents = BooleanField(default=False)

    hasTenantNames = BooleanField(default=False)

    hasUnitSizes = BooleanField(default=False)

    hasLeaseTerms = BooleanField(default=False)

    hasPropertyType = BooleanField(default=False)

    hasBuildingSize = BooleanField(default=False)

    hasLotSize = BooleanField(default=False)

    hasZoning = BooleanField(default=False)

    hasAddress = BooleanField(default=False)
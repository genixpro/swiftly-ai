from mongoengine import *
import datetime
from .unit import Unit
from .income_statement import IncomeStatement
from .discounted_cash_flow import DiscountedCashFlow
from .discounted_cash_flow_inputs import DiscountedCashFlowInputs
from .appraisal_validation_result import AppraisalValidationResult
from .comparable_sale import ComparableSale
from .stabilized_statement import StabilizedStatement
from .stabilized_statement_inputs import StabilizedStatementInputs
from .direct_comparison_valuation import DirectComparisonValuation
from .direct_comparison_valuation_inputs import DirectComparisonValuationInputs
from .market_rents import MarketRent
from .amortization_schedule import AmortizationSchedule
from .recovery_structure import RecoveryStructure
from .leasing_cost_structure import LeasingCostStructure
from .date_field import ConvertingDateField

class Appraisal(Document):
    meta = {'collection': 'appraisals', 'strict': False}

    # The owner of the appraisal
    owner = StringField()

    # The name of this appraisal. Arbitrary and chosen by the user
    name = StringField()

    # The address of the building this appraisal is being done on. This is a complete address, including street, city, and country
    address = StringField()

    # The location of the building on a map
    location = PointField()

    # The URL for the image of this building
    imageUrl = StringField()

    # The Effective Date for this appraisal
    effectiveDate = ConvertingDateField()

    # The type of property this is.
    propertyType = StringField()

    # If this property type is industrial, this is the industrial sub-type for the property
    industrialSubType = StringField()

    # If this property type is land, this is the land sub-type for the property
    landSubType = StringField()

    # This is the size of the building, in square feet
    sizeOfBuilding = FloatField()

    # This is the size of the land the building is on, in square feet
    sizeOfLand = FloatField()

    # This is the legal description of the building, which references its plot number
    legalDescription = StringField()

    # This is here to describe the zoning of the land the building is on
    zoning = StringField()

    # A list of tags associated with this comparable lease
    propertyTags = ListField(StringField())

    # A list of units within this Appraisal
    units = ListField(EmbeddedDocumentField(Unit))

    # Income statement for this Appraisal
    incomeStatement = EmbeddedDocumentField(IncomeStatement, default=IncomeStatement)

    # The inputs used in a discounted cash flow
    discountedCashFlowInputs = EmbeddedDocumentField(DiscountedCashFlowInputs, default=DiscountedCashFlowInputs)

    # Discounted cash flow for this Appraisal
    discountedCashFlow = EmbeddedDocumentField(DiscountedCashFlow)

    # The validation results for this appraisal
    validationResult = EmbeddedDocumentField(AppraisalValidationResult, default=AppraisalValidationResult)

    # A list of comparable sales that are attached to this appraisal
    comparableSales = ListField(StringField())

    # A list of comparable leases that are attached to this appraisal
    comparableLeases = ListField(StringField())

    # This is the amortization schedule
    amortizationSchedule = EmbeddedDocumentField(AmortizationSchedule, default=AmortizationSchedule)

    # These are the inputs that are put into the stabilized statement
    stabilizedStatementInputs = EmbeddedDocumentField(StabilizedStatementInputs, default=StabilizedStatementInputs, null=False)

    # This the stabilized statement
    stabilizedStatement = EmbeddedDocumentField(StabilizedStatement, default=StabilizedStatement)

    # These are the inputs that are put into the stabilized statement
    directComparisonInputs = EmbeddedDocumentField(DirectComparisonValuationInputs, default=DirectComparisonValuationInputs, null=False)

    # This the stabilized statement
    directComparisonValuation = EmbeddedDocumentField(DirectComparisonValuation, default=DirectComparisonValuation)

    # This is the market rent
    marketRents = ListField(EmbeddedDocumentField(MarketRent))

    # A list of recovery structures for this building
    recoveryStructures = ListField(EmbeddedDocumentField(RecoveryStructure))

    # A list of recovery structures for this building
    leasingCosts = ListField(EmbeddedDocumentField(LeasingCostStructure), default=[LeasingCostStructure(name="Default Leasing Costs")])


from mongoengine import *
import datetime
from .unit import Unit
from .income_statement import IncomeStatement
from .discounted_cash_flow import DiscountedCashFlow
from .discounted_cash_flow_inputs import DiscountedCashFlowInputs
from .appraisal_validation_result import AppraisalValidationResult
from .comparable_sale import ComparableSale

class Appraisal(Document):
    meta = {'collection': 'appraisals', 'strict': False}

    # The name of this appraisal. Arbitrary and chosen by the user
    name = StringField()

    # The address of the building this appraisal is being done on
    address = StringField()

    # The city that the building this appraisal is being done on is located in
    city = StringField()

    # The region that the building this appraisal is being done on is located in
    region = StringField()

    # The country that the building this appraisal is being done on is located in
    country = StringField()

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

    # A list of units within this Appraisal
    units = ListField(EmbeddedDocumentField(Unit))

    # Income statement for this Appraisal
    incomeStatement = EmbeddedDocumentField(IncomeStatement)

    # The inputs used in a discounted cash flow
    discountedCashFlowInputs = EmbeddedDocumentField(DiscountedCashFlowInputs, default=DiscountedCashFlowInputs)

    # Discounted cash flow for this Appraisal
    discountedCashFlow = EmbeddedDocumentField(DiscountedCashFlow)

    # The validation results for this appraisal
    validationResult = EmbeddedDocumentField(AppraisalValidationResult, default=AppraisalValidationResult)

    # A list of comparables that are attached to this appraisal
    comparables = ListField(StringField())
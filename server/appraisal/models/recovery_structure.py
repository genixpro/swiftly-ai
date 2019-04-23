from mongoengine import *
import datetime
from appraisal.models.calculation_rule import CalculationRule




class RecoveryStructure(EmbeddedDocument):
    name = StringField()

    baseOnUnitSize = BooleanField()

    managementCalculationRule = EmbeddedDocumentField(CalculationRule, default=CalculationRule(percentage=100, field="managementExpenses"))

    expenseCalculationRules = EmbeddedDocumentListField(CalculationRule, default=[CalculationRule(percentage=100, field="operatingExpenses")])


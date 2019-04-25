from mongoengine import *
import datetime
from appraisal.models.calculation_rule import CalculationRule




class RecoveryStructure(EmbeddedDocument):
    meta = {'strict': False}

    name = StringField()

    managementCalculationRule = EmbeddedDocumentField(CalculationRule, default=CalculationRule(percentage=100, field="managementExpenses"))

    calculatedManagementRecovery = FloatField(default=0)

    expenseRecoveries = DictField()

    taxRecoveries = DictField()

    calculatedExpenseRecoveries = DictField(default={})

    calculatedTaxRecoveries = DictField(default={})

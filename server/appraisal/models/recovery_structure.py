from mongoengine import *
import datetime
from appraisal.models.calculation_rule import CalculationRule




class RecoveryStructure(EmbeddedDocument):
    meta = {'strict': False}

    name = StringField()

    managementRecoveryMode = StringField(default="operatingExpenses", choices=["operatingExpenses", "operatingExpensesAndTaxes", "custom", "managementExpenses", "none"])

    managementRecoveryOperatingPercentage = FloatField(default=100)

    managementRecoveries = DictField()

    expenseRecoveries = DictField()

    taxRecoveries = DictField()

    calculatedManagementRecoveryBaseValue = FloatField()

    calculatedManagementRecoveryTotal = FloatField()

    calculatedManagementRecoveries = DictField(default={})

    calculatedExpenseRecoveries = DictField(default={})

    calculatedTaxRecoveries = DictField(default={})

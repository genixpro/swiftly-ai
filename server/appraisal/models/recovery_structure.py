from mongoengine import *
import datetime
from .extraction_reference import ExtractionReference


class RecoveryRule(EmbeddedDocument):
    percentage = FloatField()

    field = StringField()



class RecoveryStructure(EmbeddedDocument):
    name = StringField()

    baseOnUnitSize = BooleanField()

    managementRecoveryRule = EmbeddedDocumentField(RecoveryRule, default=RecoveryRule(percentage=100, field="managementExpenses"))

    expenseRecoveryRules = EmbeddedDocumentListField(RecoveryRule, default=[RecoveryRule(percentage=100, field="operatingExpenses")])


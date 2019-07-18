from mongoengine import *
import datetime



class ComparableAdjustment(EmbeddedDocument):
    meta = {'strict': False}

    name = StringField()

    adjustmentType = StringField(choices=[None, "", "percentage", "amount", "text"], default="percentage")

    adjustmentPercentages = DictField(FloatField(), default={})

    adjustmentAmounts = DictField(FloatField(), default={})

    adjustmentTexts = DictField(StringField(), default={})



class ComparableAdjustmentChart(EmbeddedDocument):
    meta = {'strict': False}

    # A list of adjustments
    adjustments = EmbeddedDocumentListField(ComparableAdjustment, default=[])

    showAdjustmentChart = BooleanField()


from mongoengine import *
import datetime


class DirectComparisonValuationModifier(EmbeddedDocument):
    name = StringField()
    amount = FloatField()


class DirectComparisonValuationInputs(EmbeddedDocument):
    # The price per square foot that this property will be assessed at
    pricePerSquareFoot = FloatField(default=10.0)

    # This is a dictionary mapping the modifiers that are added to the final valuation
    modifiers = ListField(EmbeddedDocumentField(DirectComparisonValuationModifier), default=[])


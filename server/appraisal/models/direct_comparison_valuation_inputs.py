from mongoengine import *
import datetime


class DirectComparisonValuationModifier(EmbeddedDocument):
    name = StringField()
    amount = FloatField()


class DirectComparisonValuationInputs(EmbeddedDocument):
    # The price per square foot that this property will be assessed at
    pricePerSquareFoot = FloatField(default=10.0)

    # The price per square foot that this property will be assessed at
    pricePerAcreLand = FloatField(default=400000.0)
    pricePerSquareFootLand = FloatField(default=5.0)
    pricePerSquareFootBuildableArea = FloatField(default=20.0)
    pricePerBuildableUnit = FloatField(default=10000.0)

    directComparisonMetric = StringField(default='psf', choices=['psf', 'psf_land', 'per_acre_land', 'psf_buildable_area', 'per_buildable_unit', None], null=True)

    # This is a dictionary mapping the modifiers that are added to the final valuation
    modifiers = ListField(EmbeddedDocumentField(DirectComparisonValuationModifier), default=[])


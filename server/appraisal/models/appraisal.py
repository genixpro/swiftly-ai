from mongoengine import *
import datetime
from .unit import Unit
from .income_statement import IncomeStatement

class Appraisal(Document):
    meta = {'collection': 'appraisals'}

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

    # A list of units within this Appraisal
    units = ListField(EmbeddedDocumentField(Unit))

    # Income statement for this Appraisal
    incomeStatement = EmbeddedDocumentField(IncomeStatement)


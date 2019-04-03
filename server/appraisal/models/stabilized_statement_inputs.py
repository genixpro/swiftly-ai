from mongoengine import *
import datetime


class StabilizedStatementInputs(EmbeddedDocument):
    # The capitalization rate for the stabilized statement
    capitalizationRate = FloatField(default=5.0)

    # The vacancy rate for the stabilized statement
    vacancyRate = FloatField(default=4.0)




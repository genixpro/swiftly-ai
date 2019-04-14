from mongoengine import *
import datetime


class MarketRent(EmbeddedDocument):
    meta = {'strict': False}

    # The name of the market rent
    name = StringField()

    # The amount per square foot of the market rent
    amountPSF = FloatField()


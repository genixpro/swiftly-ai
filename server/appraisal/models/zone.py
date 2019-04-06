from mongoengine import *
import datetime


class Zone(Document):
    meta = {'strict': False}

    # The name of the zone
    zoneName = StringField()

    # Writeup describing the zone
    description = StringField()
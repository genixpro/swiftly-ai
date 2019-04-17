from mongoengine import *
import datetime


class Zone(Document):
    meta = {'strict': False}

    # The owner of this zone
    owner = StringField()

    # The name of the zone
    zoneName = StringField()

    # Writeup describing the zone
    description = StringField()
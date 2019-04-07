from mongoengine import *
import datetime


class PropertyTag(Document):
    meta = {'strict': False}

    # The name of the propertyTag
    name = StringField()

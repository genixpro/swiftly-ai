from mongoengine import *
import datetime


class PropertyTag(Document):
    meta = {'strict': False}

    # The owner of this property tag
    owner = StringField()

    # The name of the propertyTag
    name = StringField()

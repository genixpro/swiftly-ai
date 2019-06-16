from mongoengine import *
import datetime


class PropertyTag(Document):
    meta = {'strict': False}

    # The owner of this property tag
    owner = StringField()

    # The name of the propertyTag
    name = StringField()

    # The property type associated with this tag
    propertyType = StringField()

    # A stats object which contains property
    propertyTypeStats = DictField(IntField())

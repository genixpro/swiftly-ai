from datetime import datetime
from mongoengine import Document
from mongoengine.fields import (
    DateTimeField, ReferenceField, StringField,
)


class Appraisal(Document):
    meta = {'collection': 'appraisals'}

    _id = StringField()
    name = StringField()
    address = StringField()
    city = StringField()
    region = StringField()
    country = StringField()

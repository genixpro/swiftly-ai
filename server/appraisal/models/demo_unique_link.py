from mongoengine import *
import datetime
import google.api_core.exceptions
import dateparser
from .custom_id_field import CustomIDField
from ..migrations import registerMigration
import json as json, bson
from .custom_id_field import generateNewUUID
import hashlib


class DemoUniqueLink(Document):
    meta = {
        'collection': 'demo_unique_links',
        'strict': False,
        'indexes': [
            ('email'),
            ('demoAccountEmail'),
            ('link')
        ]
    }

    id = CustomIDField()

    email = StringField()

    demoAccountEmail = StringField(null=True)

    link = StringField()



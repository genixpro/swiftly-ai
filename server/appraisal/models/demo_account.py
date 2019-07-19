from mongoengine import *
import datetime
from appraisal.models.custom_id_field import CustomIDField
from appraisal.models.extraction_reference import ExtractionReference
import google.api_core.exceptions
import dateparser
from .custom_id_field import CustomIDField
from ..migrations import registerMigration
import json as json, bson
from .custom_id_field import generateNewUUID
import hashlib
from appraisal.models.appraisal import Appraisal
from appraisal.models.comparable_lease import ComparableLease
from appraisal.models.comparable_sale import ComparableSale
from appraisal.models.property_tag import PropertyTag
from appraisal.models.zone import Zone
from appraisal.models.file import File
from appraisal.models.image import Image


class DemoAccount(Document):
    meta = {
        'collection': 'demo_accounts',
        'strict': False,
        'indexes': [
            ('used')
        ]
    }

    id = CustomIDField()

    email = StringField()

    password = StringField()

    owner = StringField()

    used = BooleanField(default=False)


from mongoengine import *
import datetime
from .extraction_reference import ExtractionReference



class Image(Document):
    url = StringField()

    fileName = StringField()




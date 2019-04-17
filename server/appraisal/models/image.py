from mongoengine import *
import datetime
from .extraction_reference import ExtractionReference



class Image(Document):
    # The owner of this image
    owner = StringField()

    url = StringField()

    fileName = StringField()




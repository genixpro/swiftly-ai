from mongoengine import *
import datetime
from appraisal.models.extraction_reference import ExtractionReference
import google.api_core.exceptions


class Image(Document):
    # The owner of this image
    owner = StringField()

    url = StringField()

    fileName = StringField()

    def downloadImageData(self, bucket, cropped=True):
        fileName = self.fileName

        if cropped:
            fileName += "-cropped"

        data = None
        try:
            blob = bucket.blob(fileName)
            data = blob.download_as_string()
        except google.api_core.exceptions.NotFound:
            return None

        return data

    def uploadImageData(self, bucket, imageData, cropped=True):
        fileName = self.fileName

        if cropped:
            fileName += "-cropped"

        blob = bucket.blob(fileName)
        blob.upload_from_string(imageData)

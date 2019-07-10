from mongoengine import *
import datetime
from appraisal.models.extraction_reference import ExtractionReference
import google.api_core.exceptions
from .custom_id_field import CustomIDField
from ..migrations import registerMigration
import rapidjson as json, bson
from .custom_id_field import generateNewUUID


class Image(Document):
    # The owner of this image
    id = CustomIDField()

    owner = StringField()

    url = StringField()

    fileName = StringField()

    version = IntField(default=1)

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


@registerMigration(Image, 4)
def migration_004_update_image_object_id(object):
    data = json.loads(object.to_json())
    if len(str(object.id)) == 24:
        del data['_id']
        data['id'] = str(object.id)

        Image.objects(id=bson.ObjectId(object.id)).delete()

        newObject = Image(**data)
        return newObject



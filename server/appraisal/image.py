from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
import pymongo
import bson
import tempfile
import subprocess
import json
import os
from .models.image import Image

@resource(collection_path='/images', path='/images/{id}', renderer='bson', cors_enabled=True, cors_origins="*")
class ImageAPI(object):

    def __init__(self, request, context=None):
        self.request = request

    def __acl__(self):
        return [(Allow, Everyone, 'everything')]

    def collection_post(self):
        # Get the data for the file out from the request object
        request = self.request

        input_file = request.POST['file'].value
        input_file_name = request.POST['fileName']

        image = Image()
        image.save()

        image.fileName = str(image.id) + "-uploaded-image.png"
        image.url = self.request.registry.storageUrl + image.fileName
        image.save()

        result = self.request.registry.azureBlobStorage.create_blob_from_bytes('files', image.fileName, input_file)

        return {"_id": str(image.id), "url": image.url}


    def post(self):
        data = self.request.json_body

        comparableId = self.request.matchdict['id']

        if '_id' in data:
            del data['_id']

        comparable = ComparableLease.objects(id=comparableId).first()
        comparable.modify(**data)

        comparable.save()

        return {"_id": str(comparableId)}

    def delete(self):
        fileId = self.request.matchdict['id']

        sale = ComparableLease.objects(id=fileId).first()
        sale.delete()

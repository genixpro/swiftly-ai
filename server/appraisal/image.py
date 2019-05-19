from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
import pymongo
import bson
import tempfile
import subprocess
import json
import os
import io
import skimage.io
from appraisal.models.image import Image
from pyramid.security import Authenticated
from pyramid.authorization import Allow, Deny, Everyone
from appraisal.authorization import checkUserOwnsObject
from pyramid.httpexceptions import HTTPForbidden
from pyramid.response import Response
import google.api_core.exceptions

@resource(collection_path='/images', path='/images/{id}', renderer='bson', cors_enabled=True, cors_origins="*", permission="everything")
class ImageAPI(object):

    def __init__(self, request, context=None):
        self.request = request
        self.storageBucket = request.registry.storageBucket

    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]

    def collection_post(self):
        # Get the data for the file out from the request object
        request = self.request

        input_file = request.POST['file'].value
        input_file_name = request.POST['fileName']

        image = Image()
        image.save()

        image.fileName = str(image.id) + "-uploaded-image.png"
        image.url = self.request.registry.apiUrl + "images/" + str(image.id)
        image.owner = self.request.authenticated_userid
        image.save()

        image.uploadImageData(self.storageBucket, input_file, cropped=False)

        # Also save a square version
        buffer = io.BytesIO()
        buffer.write(input_file)
        buffer.seek(0)

        imageArray = skimage.io.imread(buffer)

        width, height = (imageArray.shape[0], imageArray.shape[1])  # Get dimensions

        ratio = 6.4 / 4.8

        newWidth = min(width, height / ratio)
        newHeight = newWidth * ratio

        newSize = min(width, height)

        left = int((width - newWidth) / 2)
        top = int((height - newHeight) / 2)
        right = int((width + newWidth) / 2)
        bottom = int((height + newHeight) / 2)

        imageArray = imageArray[left:right, top:bottom]

        buffer = io.BytesIO()
        skimage.io.imsave(buffer, imageArray, plugin="pil")

        image.uploadImageData(self.storageBucket, buffer.getvalue(), cropped=True)

        return {"_id": str(image.id), "url": image.url}

    def get(self):
        # Get the data for the file out from the request object
        request = self.request

        imageId = self.request.matchdict['id']

        image = Image.objects(id=imageId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, image)
        if not auth:
            raise HTTPForbidden("You do not have access to this zone")

        data = image.downloadImageData(self.storageBucket, cropped=True)

        if data is None:
            return Response(status=404)

        response = Response()
        response.body = data
        # response.content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        # response.content_disposition = "attachment; filename=\"AmortizationSchedule.docx\""
        return response


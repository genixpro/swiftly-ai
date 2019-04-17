from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
import tempfile
import subprocess
import os
import io
import json
from base64 import b64encode
import re
import requests
import bson
from PIL import Image
import hashlib
from pprint import pprint
import concurrent.futures
import filetype
from .components.document_processor import DocumentProcessor
from .models.file import File, Word
from .models.appraisal import Appraisal
from pyramid.security import Authenticated
from pyramid.authorization import Allow, Deny, Everyone
from .authorization import checkUserOwnsObject, checkUserOwnsAppraisalId
from pyramid.httpexceptions import HTTPForbidden

@resource(collection_path='/appraisal/{appraisalId}/files', path='/appraisal/{appraisalId}/files/{id}', renderer='bson', cors_enabled=True, cors_origins="*", permission="everything")
class FileAPI(object):

    def __init__(self, request, context=None):
        self.request = request
        self.processor = DocumentProcessor(request.registry.db, request.registry.azureBlobStorage)

    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]

    def collection_get(self):
        appraisalId = self.request.matchdict['appraisalId']

        auth = checkUserOwnsAppraisalId(self.request.authenticated_userid, self.request.effective_principals, appraisalId)
        if not auth:
            raise HTTPForbidden("You do not have access to upload, modify or delete files on this appraisal")

        query = self.request.GET

        query["appraisalId"] = appraisalId

        if "admin" not in self.request.effective_principals:
            query["owner"] = self.request.authenticated_userid

        files = File.objects(**query).only('fileName', 'fileType')

        return {"files": [json.loads(file.to_json()) for file in files]}

    def get(self):
        appraisalId = self.request.matchdict['appraisalId']

        auth = checkUserOwnsAppraisalId(self.request.authenticated_userid, self.request.effective_principals, appraisalId)
        if not auth:
            raise HTTPForbidden("You do not have access to upload, modify or delete files on this appraisal")

        fileId = self.request.matchdict['id']

        file = File.objects(id=fileId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, file)
        if not auth:
            raise HTTPForbidden("You do not have access to this file.")

        return {"file": json.loads(file.to_json())}

    def post(self):
        data = self.request.json_body

        appraisalId = self.request.matchdict['appraisalId']
        fileId = self.request.matchdict['id']

        auth = checkUserOwnsAppraisalId(self.request.authenticated_userid, self.request.effective_principals, appraisalId)
        if not auth:
            raise HTTPForbidden("You do not have access to upload files to this appraisal")

        if '_id' in data:
            del data['_id']

        file = File.objects(id=fileId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, file)
        if not auth:
            raise HTTPForbidden("You do not have access to this file.")

        file.modify(**data)
        file.save()

        # self.updateStabilizedStatement(appraisalId)

        return {"_id": str(id)}


    def delete(self):
        appraisalId = self.request.matchdict['appraisalId']

        auth = checkUserOwnsAppraisalId(self.request.authenticated_userid, self.request.effective_principals, appraisalId)
        if not auth:
            raise HTTPForbidden("You do not have access to upload, modify or delete files on this appraisal")

        fileId = self.request.matchdict['id']

        file = File.objects(id=fileId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, file)
        if not auth:
            raise HTTPForbidden("You do not have access to this file.")

        file.delete()

    def convertOldWord(self, word):
        data = {
            k: v for k,v in word.items()
        }

        if 'hover' in data:
            del data['hover']

        data['word'] = str(data['word'])
        return Word(**data)



    def collection_post(self):
        # Get the data for the file out from the request object
        request = self.request

        input_file = request.POST['file'].value
        input_file_name = request.POST['fileName']

        appraisalId = self.request.matchdict['appraisalId']

        auth = checkUserOwnsAppraisalId(self.request.authenticated_userid, self.request.effective_principals, appraisalId)
        if not auth:
            raise HTTPForbidden("You do not have access to upload, modify or delete files on this appraisal")

        appraisal = Appraisal.objects(id=appraisalId).first()

        # Send through processing
        file = self.processor.processFileUpload(input_file_name, input_file, appraisal)


    def loadFakeData(self, fileData):
        hash = hashlib.sha256()
        hash.update(fileData)
        extractedData = {}
        extractedWords = []
        with open('appraisal/fake_data.json', 'rt') as file:
            fakeData = json.load(file)
            if hash.hexdigest() in fakeData['leases']:
                extractedData = fakeData['leases'][hash.hexdigest()]['extractedData']
                extractedWords = fakeData['leases'][hash.hexdigest()]['words']

        return extractedData, extractedWords


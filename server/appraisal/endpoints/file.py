from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
import tempfile
import subprocess
import os
import io
import json as json
from base64 import b64encode
import re
import requests
import bson
from PIL import Image
import hashlib
import json as jsondiff
from pprint import pprint
import concurrent.futures
import filetype
from appraisal.components.document_processor import DocumentProcessor
from appraisal.models.file import File, Word
from appraisal.models.appraisal import Appraisal
from pyramid.security import Authenticated
from pyramid.authorization import Allow, Deny, Everyone
from appraisal.authorization import checkUserOwnsObject, checkUserOwnsAppraisalId
from pyramid.httpexceptions import HTTPForbidden
from pyramid.response import Response
import google.api_core.exceptions
from ..models.custom_id_field import generateNewUUID, regularizeID

@resource(collection_path='/appraisal/{appraisalId}/files', path='/appraisal/{appraisalId}/files/{id}', renderer='bson', cors_enabled=True, cors_origins="*", permission="everything")
class FileAPI(object):

    def __init__(self, request, context=None):
        self.request = request
        self.processor = DocumentProcessor(request.registry.db, request.registry.storageBucket, request.registry.modelConfig, request.registry.vectorServerURL)

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

        if "view_all" not in self.request.effective_principals:
            query["owner"] = self.request.authenticated_userid

        files = File.objects(**query).only('fileName', 'fileType')

        return {"files": [json.loads(file.to_json()) for file in files]}

    def get(self):
        appraisalId = self.request.matchdict['appraisalId']

        auth = checkUserOwnsAppraisalId(self.request.authenticated_userid, self.request.effective_principals, appraisalId)
        if not auth:
            raise HTTPForbidden("You do not have access to upload, modify or delete files on this appraisal")

        fileId = self.request.matchdict['id']

        file = File.objects(id=regularizeID(fileId)).first()

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

        file = File.objects(id=regularizeID(fileId)).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, file)
        if not auth:
            raise HTTPForbidden("You do not have access to this file.")

        file.modify(**data)

        self.processor.parser.assignColumnNumbersToWords(file.words)

        file.save()

        # return {"file": json.loads(file.to_json())}

    def cleanDiffKeys(self, d):
        new = {}
        for k, v in d.items():
            if isinstance(v, dict):
                v = self.cleanDiffKeys(v)
            new[str(k)] = v
        return new


    def delete(self):
        appraisalId = self.request.matchdict['appraisalId']

        auth = checkUserOwnsAppraisalId(self.request.authenticated_userid, self.request.effective_principals, appraisalId)
        if not auth:
            raise HTTPForbidden("You do not have access to upload, modify or delete files on this appraisal")

        fileId = self.request.matchdict['id']

        file = File.objects(id=regularizeID(fileId)).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, file)
        if not auth:
            raise HTTPForbidden("You do not have access to this file.")

        appraisal = Appraisal.objects(id=regularizeID(appraisalId)).first()

        for dataType in appraisal.dataTypeReferences:
            toRemove = []
            for reference in appraisal.dataTypeReferences[dataType]:
                if reference.fileId == fileId:
                    toRemove.append(reference)

            for reference in toRemove:
                appraisal.dataTypeReferences[dataType].remove(reference)

        appraisal.save()

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

        appraisal = Appraisal.objects(id=regularizeID(appraisalId)).first()

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


@resource(path='/appraisal/{appraisalId}/files/{id}/reprocess', renderer='bson', cors_enabled=True, cors_origins="*", permission="everything")
class ReprocessFileAPI(object):

    def __init__(self, request, context=None):
        self.request = request
        self.processor = DocumentProcessor(request.registry.db, request.registry.storageBucket, request.registry.modelConfig, request.registry.vectorServerURL)

    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]

    def post(self):
        appraisalId = self.request.matchdict['appraisalId']
        fileId = self.request.matchdict['id']

        auth = checkUserOwnsAppraisalId(self.request.authenticated_userid, self.request.effective_principals, appraisalId)
        if not auth:
            raise HTTPForbidden("You do not have access to reprocess this appraisal")

        appraisal = Appraisal.objects(id=regularizeID(appraisalId)).first()
        file = File.objects(id=regularizeID(fileId)).first()

        self.processor.extractAndMergeAppraisalData(file, appraisal)
        self.processor.processAppraisalResults(appraisal)

        appraisal.save()

        # self.updateStabilizedStatement(appraisalId)

        return {"_id": str(id)}


@resource(path='/appraisal/{appraisalId}/files/{id}/contents', renderer='bson', cors_enabled=True, cors_origins="*", permission="everything")
class FileContentsAPI(object):

    def __init__(self, request, context=None):
        self.request = request
        self.storageBucket = request.registry.storageBucket

    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]

    def get(self):
        appraisalId = self.request.matchdict['appraisalId']

        auth = checkUserOwnsAppraisalId(self.request.authenticated_userid, self.request.effective_principals, appraisalId)
        if not auth:
            raise HTTPForbidden("You do not have access to upload, modify or delete files on this appraisal")

        fileId = self.request.matchdict['id']

        file = File.objects(id=regularizeID(fileId)).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, file)
        if not auth:
            raise HTTPForbidden("You do not have access to this file.")

        data = file.downloadFileData(self.storageBucket)

        if data is None:
            return Response(status=404)

        response = Response()
        response.body = data
        # response.content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        # response.content_disposition = "attachment; filename=\"AmortizationSchedule.docx\""
        return response


@resource(path='/appraisal/{appraisalId}/files/{id}/rendered/{page}', renderer='bson', cors_enabled=True, cors_origins="*", permission="everything")
class FileRenderedImagesAPI(object):

    def __init__(self, request, context=None):
        self.request = request
        self.storageBucket = request.registry.storageBucket

    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]

    def get(self):
        appraisalId = self.request.matchdict['appraisalId']

        auth = checkUserOwnsAppraisalId(self.request.authenticated_userid, self.request.effective_principals, appraisalId)
        if not auth:
            raise HTTPForbidden("You do not have access to upload, modify or delete files on this appraisal")

        fileId = self.request.matchdict['id']

        file = File.objects(id=regularizeID(fileId)).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, file)
        if not auth:
            raise HTTPForbidden("You do not have access to this file.")

        page = self.request.matchdict['page']

        data = file.downloadRenderedImage(page, self.storageBucket)

        if data is None:
            return Response(status=404)

        response = Response()
        response.body = data
        # response.content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        # response.content_disposition = "attachment; filename=\"AmortizationSchedule.docx\""
        return response


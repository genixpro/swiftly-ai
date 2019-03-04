from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
from webob_graphql import serve_graphql_request
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
from .components.document_classifier import DocumentClassifier
from .components.document_parser import DocumentParser
from .components.document_extractor import DocumentExtractor
from .components.document import Document
from .components.page_classifier import PageClassifier

@resource(collection_path='/appraisal/{appraisalId}/files', path='/appraisal/{appraisalId}/files/{id}', renderer='bson', cors_enabled=True, cors_origins="*")
class FileAPI(object):

    def __init__(self, request, context=None):
        self.request = request
        self.filesCollection = request.registry.db['files']
        self.classifier = DocumentClassifier()
        self.parser = DocumentParser()
        self.pageClassifier = PageClassifier()

    def __acl__(self):
        return [(Allow, Everyone, 'everything')]

    def collection_get(self):
        appraisalId = self.request.matchdict['appraisalId']

        query = self.request.GET

        query["appraisalId"] = appraisalId

        files = self.filesCollection.find(query, ['fileName', 'type'])

        return {"files": list(files)}

    def get(self):
        appraisalId = self.request.matchdict['appraisalId']
        fileId = self.request.matchdict['id']

        file = self.filesCollection.find_one({"_id": bson.ObjectId(fileId), "appraisalId": appraisalId})

        return {"file": file}

    def post(self):
        data = self.request.json_body

        appraisalId = self.request.matchdict['appraisalId']
        fileId = self.request.matchdict['id']

        if '_id' in data:
            del data['_id']

        self.filesCollection.update_one({"_id": bson.ObjectId(fileId)}, {"$set": data})

        # self.updateStabilizedStatement(appraisalId)

        return {"_id": str(id)}


    def collection_post(self):
        # Get the data for the file out from the request object
        request = self.request

        input_file = request.POST['file'].value
        input_file_name = request.POST['fileName']

        appraisalId = self.request.matchdict['appraisalId']

        data = {
            "fileName": input_file_name,
            "appraisalId": appraisalId
        }

        # extractedData, extractedWords = self.loadFakeData(input_file)

        existingFile = self.filesCollection.find_one({"fileName": input_file_name})
        if existingFile and 'extractedData' in existingFile:
            extractedData = existingFile['extractedData']
            extractedWords = existingFile['words']
        else:
            extractedData = {}
            extractedWords = []


        insertResult = self.filesCollection.insert_one(data)
        mimeType = filetype.guess(input_file).mime
        fileId = str(insertResult.inserted_id)

        result = request.registry.azureBlobStorage.create_blob_from_bytes('files', fileId, input_file)

        if mimeType == 'application/pdf':
            images, words = self.parser.processPDF(input_file, extractWords=(len(extractedData) == 0), local=True)

            imageFileNames = []
            for page, imageData in enumerate(images):
                fileName = fileId + "-image-" + str(page) + ".png"
                result = self.request.registry.azureBlobStorage.create_blob_from_bytes('files', fileName, imageData)
                imageFileNames.append(fileName)

            result = self.filesCollection.update_one({"_id": insertResult.inserted_id}, {"$set": {"pageCount": len(images), "images": imageFileNames}})
        elif mimeType == 'image/png':
            words = self.parser.processImage(input_file, fileId, extractWords=(len(extractedData) == 0))

            fileName = fileId + "-image-0.png"
            result = self.request.registry.azureBlobStorage.create_blob_from_bytes('files', fileName, input_file)
            images = [fileName]

            result = self.filesCollection.update_one({"_id": insertResult.inserted_id}, {"$set": {"pageCount": 1, "images": [fileName]}})
        else:
            raise ValueError(f"Unsupported file type provided: {mimeType}")

        if len(extractedWords) > 0:
            words = extractedWords

        data['extractedData'] = extractedData
        data['words'] = words

        data['pages'] = len(images)

        data['pageTypes'] = self.pageClassifier.classifyFile(data)

        if len(extractedWords) == 0:
            extractor = DocumentExtractor(request.registry.db)
            extractor.predictDocument(Document(data))


        data['type'] = self.classifier.classifyFile(data)

        self.filesCollection.update_one({
            "_id": bson.ObjectId(fileId)
        }, {
            "$set": data
        })


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


from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
from webob_graphql import serve_graphql_request
import tempfile
import subprocess
import os
import io
import json
import re
import hashlib
from pprint import pprint


@resource(collection_path='/appraisal/{appraisalId}/files', path='/appraisal/{appraisalId}/files/{id}', renderer='bson', cors_enabled=True, cors_origins="*")
class FileAPI(object):

    def __init__(self, request, context=None):
        self.request = request
        self.filesCollection = request.registry.db['files']
        self.leasesCollection = request.registry.db['leases']


    def __acl__(self):
        return [(Allow, Everyone, 'everything')]

    def collection_get(self):
        appraisalId = self.request.matchdict['appraisalId']

        files = self.filesCollection.find({"appraisalId": appraisalId})

        return {"files": list(files)}

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

        insertResult = self.filesCollection.insert_one(data)

        id = str(insertResult.inserted_id)

        hash = hashlib.sha256()
        hash.update(input_file)
        extractedData = {}
        extractedWords = []
        with open('appraisal/fake_data.json', 'rt') as file:
            fakeData = json.load(file)
            if hash.hexdigest() in fakeData['leases']:
                extractedData = fakeData['leases'][hash.hexdigest()]['extractedData']
                extractedWords = fakeData['leases'][hash.hexdigest()]['words']

        print(hash.hexdigest())

        result = request.registry.azureBlobStorage.create_blob_from_bytes('files', id, input_file)

        with tempfile.TemporaryDirectory() as dir:
            with tempfile.NamedTemporaryFile('wb', dir=dir, suffix=input_file_name.split(".")[-1]) as tempFile:
                tempFile.write(input_file)

                process = subprocess.run(['pdftoppm', tempFile.name, "-png", "-r", "300", "image"], cwd=dir)

                files = [file for file in os.listdir(dir) if file.endswith('png')]
                for file in files:
                    imageIndex = int(file.split(".")[0].split("-")[1])

                    with open(os.path.join(dir, file), 'rb') as pngImage:
                        result = request.registry.azureBlobStorage.create_blob_from_bytes('files', id + "-image-" + str(imageIndex) + ".png", pngImage.read())

                result = self.filesCollection.update_one({"_id": insertResult.inserted_id}, {"$set": {"pageCount": len(files), "images": files}})

                result = subprocess.run(['pdftotext', "-bbox", tempFile.name, "-"], cwd=dir, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

                resultText = str(result.stdout, 'utf8')

                lines = resultText.split("\n")
                lines = [line.strip() for line in lines]

                pagePattern = "<page width=\"([\d\.]+)\" height=\"([\d\.]+)\">"
                pageRegex = re.compile(pagePattern)
                wordPattern = "<word xMin=\"([\d\.]+)\" yMin=\"([\d\.]+)\" xMax=\"([\d\.]+)\" yMax=\"([\d\.]+)\">(.*)</word>"
                wordRegex = re.compile(wordPattern)

                words = []

                page = -1
                width = 0
                height = 0
                for line in lines:
                    if line.startswith("<page"):
                        width = float(pageRegex.fullmatch(line).group(1))
                        height = float(pageRegex.fullmatch(line).group(2))
                        page += 1
                    elif line.startswith("<word"):
                        word = {
                                "word": wordRegex.fullmatch(line).group(5),
                                "page": page,
                                "left": float(wordRegex.fullmatch(line).group(1)) / width,
                                "right": float(wordRegex.fullmatch(line).group(3)) / width,
                                "top": float(wordRegex.fullmatch(line).group(2)) / height,
                                "bottom": float(wordRegex.fullmatch(line).group(4)) / height
                            }

                        if word['word'].lower() in ['example', 'corporation', 'inc.']:
                            word['classification'] = 'counterparty_name'
                        else:
                            word['classification'] = 'null'

                        words.append(word)

        pprint(words)

        if 'lease' in input_file_name.lower():
            self.leasesCollection.insert_one({
                "fileId": id,
                "appraisalId": appraisalId,
                "fileName": input_file_name,
                "monthlyRent": 10000,
                "pages": len(files),
                "pricePerSquareFoot": 5,
                "size": 2000,
                "words": extractedWords,
                "extractedData": extractedData
            })

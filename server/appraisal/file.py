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
from PIL import Image
import hashlib
from pprint import pprint
import concurrent.futures
import filetype


@resource(collection_path='/appraisal/{appraisalId}/files', path='/appraisal/{appraisalId}/files/{id}', renderer='bson', cors_enabled=True, cors_origins="*")
class FileAPI(object):

    def __init__(self, request, context=None):
        self.request = request
        self.filesCollection = request.registry.db['files']
        self.leasesCollection = request.registry.db['leases']
        self.financialStatementsCollection = request.registry.db['financial_statements']
        self.comparableSalesCollection = request.registry.db['comparable_sales']


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

        mimeType = filetype.guess(input_file).mime

        fileId = str(insertResult.inserted_id)

        extractedData, extractedWords = self.loadFakeData(input_file)

        result = request.registry.azureBlobStorage.create_blob_from_bytes('files', fileId, input_file)

        if mimeType == 'application/pdf':
            images, words = self.processPDF(input_file, fileId)
            result = self.filesCollection.update_one({"_id": insertResult.inserted_id}, {"$set": {"pageCount": len(images), "images": images}})
        elif mimeType == 'image/png':
            images, words = self.processImage(input_file, fileId)
            result = self.filesCollection.update_one({"_id": insertResult.inserted_id}, {"$set": {"pageCount": len(images), "images": images}})
        else:
            raise ValueError(f"Unsupported file type provided: {mimeType}")

        if len(extractedWords) > 0:
            words = extractedWords

        if mimeType == 'image/png':
            self.comparableSalesCollection.insert_one({
                "fileId": fileId,
                "appraisalId": appraisalId,
                "fileName": input_file_name,
                "pages": len(images),
                "words": words,
                "extractedData": extractedData
            })
        elif 'cash' in input_file_name.lower():
            self.financialStatementsCollection.insert_one({
                "fileId": fileId,
                "appraisalId": appraisalId,
                "fileName": input_file_name,
                "monthlyRent": 10000,
                "pages": len(images),
                "pricePerSquareFoot": 5,
                "size": 2000,
                "words": words,
                "extractedData": extractedData
            })
        else:
            self.leasesCollection.insert_one({
                "fileId": fileId,
                "appraisalId": appraisalId,
                "fileName": input_file_name,
                "monthlyRent": 10000,
                "pages": len(images),
                "pricePerSquareFoot": 5,
                "size": 2000,
                "words": words,
                "extractedData": extractedData
            })


    def processImage(self, imageData, fileId):
        fileName = fileId + "-image-0.png"
        result = self.request.registry.azureBlobStorage.create_blob_from_bytes('files', fileName, imageData)

        words = self.extractWordsFromPDFGoogle(imageData, 0)

        return [fileName], words

    def processPDF(self, input_file, fileId):
        with tempfile.TemporaryDirectory() as dir:
            with tempfile.NamedTemporaryFile('wb', dir=dir, suffix="pdf") as tempFile:
                tempFile.write(input_file)

                pdfInfo = self.getPDFInfo(os.path.join(dir, tempFile.name))

                imageFutures = []
                with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
                    for page in range(pdfInfo['pages']):
                        future = pool.submit(self.renderPDFPage, tempFile.name, page, fileId)
                        imageFutures.append(future)

                images = [future.result()[1] for future in imageFutures]

                words = []
                with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
                    pageFutures = []
                    for page in range(pdfInfo['pages']):
                        future = executor.submit(self.extractWordsFromPDFGoogle, imageFutures[page].result()[0], page)
                        pageFutures.append(future)

                    for future in pageFutures:
                        words = words + future.result()

        return images, words

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


    def getPDFInfo(self, pdfFileName):
        process = subprocess.run(['pdfinfo', pdfFileName], stdout=subprocess.PIPE)
        result = str(process.stdout, 'utf8')
        lines = result.split("\n")

        data = {}
        for line in lines:
            if line.startswith("Pages:"):
                data['pages'] = int(line.split()[1])
        return data

    def renderPDFPage(self, pdfFileName, page, fileId):
        with tempfile.TemporaryDirectory() as dir:
            process = subprocess.run(['pdftoppm', pdfFileName, "-png", "-r", "300", "image", "-f", str(page+1), "-l", str(page+1)], cwd=dir)
            fileName = os.listdir(dir)[0]

            with open(os.path.join(dir, fileName), 'rb') as pngImage:
                imageData = pngImage.read()
                fileName = fileId + "-image-" + str(page) + ".png"
                result = self.request.registry.azureBlobStorage.create_blob_from_bytes('files', fileName, imageData)

                return imageData, fileName

    def extractWordsFromPDFLocal(self, fileName):
        result = subprocess.run(['pdftotext', "-bbox", fileName, "-"], cwd=dir, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

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
        self.assignLineNumbersToWords(words)
        words = sorted(words, key=lambda word: (word['lineNumber'], word['left']))
        return words


    def extractWordsFromPDFGoogle(self, imageData, page):
        response = requests.post('https://vision.googleapis.com/v1/images:annotate',
                                 json={
                                     "requests": [{
                                         "image": {"content": b64encode(imageData).decode()},
                                         "features": [{
                                             'type': 'DOCUMENT_TEXT_DETECTION',
                                             'maxResults': 1
                                         }]
                                     }]
                                 },
                                 params={'key': "AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I"},
                                 headers={'Content-Type': 'application/json'})

        memFile = io.BytesIO()
        memFile.write(imageData)
        memFile.seek(0)
        im = Image.open(memFile)

        words = []

        for annotation in response.json()['responses'][0]['textAnnotations'][1:]:
            word = {
                "word": annotation['description'],
                "page": page,
                "left": min([vertex.get('x', 0) - 3 for vertex in annotation['boundingPoly']['vertices']]) / im.width,
                "right": max([vertex.get('x', 0) + 3 for vertex in annotation['boundingPoly']['vertices']]) / im.width,
                "top": min([vertex.get('y', 0) - 1 for vertex in annotation['boundingPoly']['vertices']]) / im.height,
                "bottom": max([vertex.get('y', 0) + 1 for vertex in annotation['boundingPoly']['vertices']]) / im.height
            }

            if word['word'].lower() in ['example', 'corporation', 'inc.']:
                word['classification'] = 'counterparty_name'
            else:
                word['classification'] = 'null'

            words.append(word)
        self.assignLineNumbersToWords(words)
        words = sorted(words, key=lambda word: (word['lineNumber'], word['left']))
        return words

    def verticalIntersectionOverUnion(self, line1, line2):
        if line1['top'] > line2['bottom']:
            return 0
        elif line2['top'] > line1['bottom']:
            return 0
        else:
            unionTop = min(line1['top'], line2['top'])
            unionBottom = max(line1['bottom'], line2['bottom'])
            union = unionBottom - unionTop

            intersectionTop = max(line1['top'], line2['top'])
            intersectionBottom = min(line1['bottom'], line2['bottom'])
            intersection = intersectionBottom - intersectionTop

            return intersection / union

    def assignLineNumbersToWords(self, words):
        wordsByPage = {}
        for word in words:
            if word['page'] not in wordsByPage:
                wordsByPage[word['page']] = []
            wordsByPage[word['page']].append(word)

        for page in wordsByPage.keys():
            lines = []

            sortedWords = sorted(wordsByPage[page], key=lambda word: word['left'])
            for word in sortedWords:
                # Find the maximum IoU between this word and any existing lines
                bestIoU = None
                bestLine = None
                for line in lines:
                    iou = self.verticalIntersectionOverUnion(word, line)
                    if bestIoU is None or iou > bestIoU:
                        bestIoU = iou
                        bestLine = line

                # If intersection over union > 0.7, take on the same line
                if bestLine is not None and bestIoU > 0.7:
                    word['line'] = bestLine
                    bestLine['top'] = min(bestLine['top'], word['top'])
                    bestLine['bottom'] = max(bestLine['bottom'], word['bottom'])
                else:
                    newLine = {
                        'top': word['top'],
                        'bottom': word['bottom']
                    }
                    lines.append(newLine)
                    word['line'] = newLine

            # Now sort the lines by their top point
            lines = sorted(lines, key=lambda line: line['top'])

            # Assign the line numbers to all the lines
            for lineNumber, line in enumerate(lines):
                line['lineNumber'] = lineNumber

            for word in sortedWords:
                word['lineNumber'] = word['line']['lineNumber']
                del word['line']


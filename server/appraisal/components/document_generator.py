import pkg_resources
import csv
import random
import math
from pprint import pprint
import docx
import io
from .document_parser import DocumentParser

class DocumentGenerator:
    def __init__(self):
        self.templates = [file for file in pkg_resources.resource_listdir("appraisal", "templates") if file.endswith('.docx')]

        self.templateFieldFiles = {
            file.replace(".csv", ""): file
            for file in pkg_resources.resource_listdir("appraisal", "templates")
            if file.endswith(".csv")
        }

        self.parser = DocumentParser()


    def loadTemplateFields(self, templateType):
        fieldsFile = self.templateFieldFiles[templateType]
        csvFileStream = pkg_resources.resource_stream('appraisal', f'templates/{fieldsFile}')

        rows = csv.DictReader(io.TextIOWrapper(csvFileStream))

        fields = {}

        for row in rows:
            for key in row:
                if row[key] is not None and row[key] != "":
                    if key not in fields:
                        fields[key] = []
                    fields[key].append(row[key])
        return fields


    def generateDocument(self, template, templateType):
        fields = self.loadTemplateFields(templateType)

        # First we convert the raw template into words with coordinates. This allows us to identify
        # the location of the template tokens within the original document, in terms of X/Y coordinates.
        templateStream = pkg_resources.resource_stream('appraisal', f'templates/{template}')
        templateData = templateStream.read()
        images, templateWords = self.parser.processDocx(templateData)

        tokenWords = {}
        for word in templateWords:
            # print(word['word'])
            startString = "&lt;&lt;"
            endString = "&gt;&gt;"

            if startString in word['word'] and endString in word['word']:
                if word['word'] in tokenWords:
                    raise ValueError("Template has multiple injection points with same label.")

                startIndex = word['word'].find(startString)
                endIndex = word['word'].find(endString)

                key = word['word'][startIndex+len(startString):endIndex]

                tokenWords[key] = word

        print(tokenWords)

        document = docx.Document(pkg_resources.resource_stream('appraisal', f'templates/{template}'))

        for paragraph in document.paragraphs:
            for field in fields:
                keyname = f"<<{field}>>"

                if keyname in paragraph.text:
                    replacement = random.choice(fields[field])

                    paragraph.text = paragraph.text.replace(keyname, replacement)

                    tokenWords[field]['replacement'] = replacement

        bufferFile = io.BytesIO()
        document.save(bufferFile)

        data = bufferFile.getbuffer()

        images, words = self.parser.processDocx(data)

        for key in tokenWords:
            tokenWord = tokenWords[key]

            replacementWords = tokenWord['replacement'].split()

            matchingWords = {
                self.removeSymbols(word): [] for word in replacementWords
            }

            for word in words:
                if self.removeSymbols(word['word']) in matchingWords:
                    matchingWords[self.removeSymbols(word['word'])].append(word)

            for replacementWord in matchingWords:
                replacementMatches = matchingWords[replacementWord]

                bestWord = None
                bestDistance = None
                for word in replacementMatches:
                    distX = abs(word['left'] - tokenWord['left'])
                    distY = abs((word['top'] + word['page']) - (tokenWord['top'] + tokenWord['page']))

                    dist = math.sqrt(distX * distX + distY * distY)

                    if bestDistance is None or dist < bestDistance:
                        bestWord = word

                if bestWord is not None:
                    bestWord['classification'] = key
        pprint(words)

    def removeSymbols(self, text):
        symbols = ".,<>!@#$%^&*(){}[]|\;:'\"/?"
        for symbol in symbols:
            text = text.replace(symbol, "")
        return text
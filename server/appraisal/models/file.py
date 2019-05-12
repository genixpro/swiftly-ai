from mongoengine import *
import datetime
from appraisal.models.extraction_reference import ExtractionReference
import google.api_core.exceptions
import azure.common

class Word(EmbeddedDocument):
    meta = {'strict': False}

    # This is the raw text of the word
    word = StringField()

    # The page within the document that this word is located on
    page = IntField()

    # This is the line number of the word, within the page that its on (line numbers reset to 0 on new pages)
    lineNumber = IntField()

    documentLineNumber = IntField()

    # The column number for this word
    column = IntField()

    # The index of the word within the larger array of words
    index = IntField()

    # The coordinate of the left edge of the word, between 0 and 1
    left = FloatField()

    # The coordinate of the right edge of the word, between 0 and 1
    right = FloatField()

    # The coordinate of the top edge of the word, between 0 and 1
    top = FloatField()

    # The coordinate of the bottom edge of the word, between 0 and 1
    bottom = FloatField()

    # This is the classification of this word, for data extraction purposes
    classification = StringField()

    # This gives the probabilities assigned to each classification
    classificationProbabilities = DictField(default={})

    # These are modifiers that are attached to the classification this word is in. Unlike the classification, there may be one or more modifiers
    modifiers = ListField(StringField(), default=[])

    # This gives the probabilities assigned to each modifier
    modifierProbabilities = DictField(default={})


    textType = StringField(default='block')

    groups = DictField(StringField(), default={})
    groupProbabilities = DictField(DictField(default={}))
    groupNumbers = DictField(IntField())


class File(Document):
    meta = {'collection': 'files', 'strict': False}

    owner = StringField()

    # The review status for this document
    reviewStatus = StringField(default="fresh")

    # The ID of the Appraisal object that this File is attached to
    appraisalId = StringField()

    # The type of this document
    fileType = StringField()

    # This is a list of filenames for images rendered from this document
    images = ListField(StringField())

    # A list of words that were found in this document
    words = ListField(EmbeddedDocumentField(Word))

    # The number of pages within the document
    pages = IntField()

    # A list containing the page-type classifications for each page in the file
    pageTypes = ListField(StringField())

    def breakIntoTokens(self):
        tokens = []
        currentToken = None
        for word in self.words:
            if word['classification'] != "null":
                if currentToken is None:
                    currentToken = {
                        "classification": word.classification,
                        "modifiers": word.modifiers,
                        "words": [word],
                        "startIndex": word.index
                    }
                elif currentToken['classification'] == word.classification and set(currentToken['modifiers']) == set(word.modifiers):
                    currentToken['words'].append(word)
                else:
                    currentToken['endIndex'] = word.index
                    tokens.append(currentToken)
                    currentToken = {
                        "classification": word.classification,
                        "modifiers": word.modifiers,
                        "words": [word],
                        "startIndex": word.index
                    }
            else:
                if currentToken is not None:
                    currentToken['endIndex'] = word.index
                    tokens.append(currentToken)
                    currentToken = None

        for token in tokens:
            text = ""
            for word in token['words']:
                text += word['word'] + " "
            text = text.strip()
            token['text'] = text
            token['pageType'] = self.pageTypes[token['words'][0]['page']]


        return tokens

    def getDocumentYear(self):
        tokens = self.breakIntoTokens()

        date = ""
        for token in tokens:
            if token['classification'] == 'STATEMENT_YEAR':
                return int(token['text'])
            elif token['classification'] == 'STATEMENT_DATE':
                date = token['text']

        if date == '':
            return int(datetime.datetime.now().year)

        parsed = dateparser.parse(date)

        return int(parsed.year)

    def getLineItems(self, pageType):
        tokens = self.breakIntoTokens()

        tokens = [token for token in tokens if token['pageType'] == pageType]

        year = int(self.getDocumentYear())

        tokensByLineNumberAndPage = {}
        for token in tokens:
            if token['classification'] != "null":
                lineNumberPage = (token['words'][0]['page'], token['words'][0]['lineNumber'])
                if lineNumberPage in tokensByLineNumberAndPage:
                    tokensByLineNumberAndPage[lineNumberPage].append(token)
                else:
                    tokensByLineNumberAndPage[lineNumberPage] = [token]

        lineItems = []

        for lineNumberPage in tokensByLineNumberAndPage:
            groupedByClassification = {}
            for token in tokensByLineNumberAndPage[lineNumberPage]:
                if token['classification'] in groupedByClassification:
                    groupedByClassification[token['classification']].append(token)
                else:
                    groupedByClassification[token['classification']] = [token]

            maxSize = max([len(groupedByClassification[classification]) for classification in groupedByClassification])

            items = [{
                'modifiers': set()
            } for n in range(maxSize)]
            for classification in groupedByClassification:
                for tokenIndex, token in enumerate(groupedByClassification[classification]):
                    if len(groupedByClassification[classification]) == 1:
                        itemsForGroup = items
                    else:
                        itemsForGroup = [items[tokenIndex]]

                    for item in itemsForGroup:
                        item[token['classification']] = token['text']
                        item[token['classification'] + "_reference"] = ExtractionReference(fileId=str(self.id), appraisalId=str(self.appraisalId), wordIndexes=[word['index'] for word in token['words']])
                        for modifier in token['modifiers']:
                            item['modifiers'].add(modifier)

            for item in items:
                if 'NEXT_YEAR' in item['modifiers']:
                    item['year'] = year + 1
                elif 'PREVIOUS_YEAR' in item['modifiers']:
                    item['year'] = year - 1
                else:
                    item['year'] = year

            lineItems.extend(items)

        return lineItems

    def downloadFileData(self, bucket, azureBlobStorage=None):
        fileId = str(self.id)

        data = None
        try:
            blob = bucket.blob(fileId)
            data = blob.download_as_string()
        except google.api_core.exceptions.NotFound:
            if azureBlobStorage:
                try:
                    data = azureBlobStorage.get_blob_to_bytes('files', fileId).content
                except azure.common.AzureMissingResourceHttpError:
                    pass

        return data

    def downloadRenderedImage(self, page, bucket, azureBlobStorage=None):
        fileId = str(self.id)
        imageFilename = fileId + "-image-" + str(page) + ".png"

        data = None
        try:
            blob = bucket.blob(imageFilename)
            data = blob.download_as_string()
        except google.api_core.exceptions.NotFound:
            if azureBlobStorage:
                try:
                    data = azureBlobStorage.get_blob_to_bytes('files', imageFilename).content
                except azure.common.AzureMissingResourceHttpError:
                    pass

        return data

    def uploadFileData(self, bucket, data):
        fileId = str(self.id)

        blob = bucket.blob(fileId)
        blob.upload_from_string(data)

    def uploadRenderedImage(self, page, bucket, data):
        fileName = str(self.id) + "-image-" + str(page) + ".png"
        blob = bucket.blob(fileName)
        blob.upload_from_string(data)

        return fileName

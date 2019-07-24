from mongoengine import *
import datetime
from appraisal.models.custom_id_field import CustomIDField
from appraisal.models.extraction_reference import ExtractionReference
import google.api_core.exceptions
import dateparser
from .custom_id_field import CustomIDField
from ..migrations import registerMigration
import json as json, bson
from .custom_id_field import generateNewUUID
import hashlib

class Word(EmbeddedDocument):
    meta = {'strict': False}

    def __init__(self, *args, **kwargs):
        super(Word, self).__init__(*args, **kwargs)

    # This is the raw text of the word
    word = StringField()

    # The page within the document that this word is located on
    page = IntField()

    # This is the line number of the word, within the page that its on (line numbers reset to 0 on new pages)
    lineNumber = IntField()

    documentLineNumber = IntField()

    # The column number for this word
    column = IntField()

    documentColumn = IntField()

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
    textTypeProbabilities = DictField(default={})

    groups = DictField(StringField(), default={})
    groupProbabilities = DictField(DictField(default={}))
    groupNumbers = DictField(IntField())

    lineNumberWithinGroup = DictField(IntField())
    reverseLineNumberWithinGroup = DictField(IntField())


class File(Document):
    meta = {
        'collection': 'files',
        'strict': False,
        'indexes': [
            ('owner', 'appraisalId'),
            ('owner', 'fileType'),
            ('hash'),
            'version'
        ]
    }

    id = CustomIDField()

    owner = StringField()

    # The review status for this document
    fileName = StringField()

    # The review status for this document
    reviewStatus = StringField(default="fresh")

    # The ID of the Appraisal object that this File is attached to
    appraisalId = StringField()

    # This is an SHA-256 hash of the original file upload
    hash = StringField()

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

    version = IntField(default=1)

    def breakIntoTokens(self):
        tokens = []
        currentToken = None
        for word in self.words:
            if word.classification != "null":
                if currentToken is None:
                    currentToken = {
                        "classification": word.classification,
                        "modifiers": word.modifiers,
                        "groups": word.groups,
                        "groupNumbers": word.groupNumbers,
                        "textType": word.textType,
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
                        "groups": word.groups,
                        "groupNumbers": word.groupNumbers,
                        "textType": word.textType,
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
                text += word.word + " "
            text = text.strip()
            token['text'] = text


        return tokens


    def updateDescriptiveWordFeatures(self):
        """ This function updates fields like lineNumberWithinGroup and reverseLineNumberWithinGroup on the Word object."""

        currentGroupTypes = {}
        currentGroupNumbers = {}
        currentGroupStartLineNumber = {}
        currentGroupWords = {}

        def finishGroup(groupSet):
            nonlocal currentGroupWords
            if len(currentGroupWords[groupSet]):
                maxLineNumber = max([groupWord.documentLineNumber for groupWord in currentGroupWords[groupSet]])
                for groupWord in currentGroupWords[groupSet]:
                    groupWord.reverseLineNumberWithinGroup[groupSet] = maxLineNumber - groupWord.lineNumberWithinGroup[groupSet]


        for word in self.words:
            # print(word.index, word.lineNumber, word.documentLineNumber)
            word.lineNumberWithinGroup = {}

            for groupSet, group in word.groups.items():
                if group != 'null' and group is not None:
                    if groupSet not in currentGroupTypes:
                        word.lineNumberWithinGroup[groupSet] = 0

                        currentGroupWords[groupSet] = [word]
                        currentGroupNumbers[groupSet] = word.groupNumbers[groupSet]
                        currentGroupTypes[groupSet] = word.groups[groupSet]
                        currentGroupStartLineNumber[groupSet] = word.documentLineNumber
                    elif group == currentGroupTypes[groupSet] and word.groupNumbers[groupSet] == currentGroupNumbers[groupSet]:
                        word.lineNumberWithinGroup[groupSet] = word.documentLineNumber - currentGroupStartLineNumber[groupSet]
                        currentGroupWords[groupSet].append(word)
                    else:
                        finishGroup(groupSet)

                        word.lineNumberWithinGroup[groupSet] = 0

                        currentGroupWords[groupSet] = [word]
                        currentGroupNumbers[groupSet] = word.groupNumbers[groupSet]
                        currentGroupTypes[groupSet] = word.groups[groupSet]
                        currentGroupStartLineNumber[groupSet] = word.documentLineNumber

            for groupSet in currentGroupWords.keys():
                if word.groups.get(groupSet, 'null') == 'null':
                    finishGroup(groupSet)

                    currentGroupWords[groupSet] = []
                    currentGroupNumbers[groupSet] = None
                    currentGroupTypes[groupSet] = 'null'
                    currentGroupStartLineNumber[groupSet] = None

        for groupSet in currentGroupWords.keys():
            finishGroup(groupSet)

    def downloadFileData(self, bucket):
        fileId = str(self.id)

        data = None
        try:
            blob = bucket.blob(fileId)
            data = blob.download_as_string()
        except google.api_core.exceptions.NotFound:
            return None

        return data

    def downloadRenderedImage(self, page, bucket):
        fileId = str(self.id)
        imageFilename = fileId + "-image-" + str(page) + ".png"

        data = None
        try:
            blob = bucket.blob(imageFilename)
            data = blob.download_as_string()
        except google.api_core.exceptions.NotFound:
            return None

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

    def extractGroups(self, type=None):
        groupWords = {}

        for word in self.words:
            if word.groups.get('DATA_TYPE') and (type is None or word.groups.get['DATA_TYPE'] == type):
                group = word.groups['DATA_TYPE']
                groupId = (group, word.groupNumbers['DATA_TYPE'])

                if groupId in groupWords:
                    groupWords[groupId].append(word)
                else:
                    groupWords[groupId] = [word]

        return [
            words for groupId,words in groupWords.items()
        ]


@registerMigration(File, 2)
def migration_001_002_update_file_object_id(object):
    data = json.loads(object.to_json())
    if len(str(object.id)) == 24:
        del data['_id']
        data['id'] = str(object.id)

        File.objects(id=bson.ObjectId(object.id)).delete()

        newObject = File(**data)
        return newObject

@registerMigration(File, 3)
def migration_003_update_document_hash(object, storageBucket):
    data = object.downloadFileData(storageBucket)

    m = hashlib.sha256()
    m.update(data)
    hash = m.hexdigest()

    object.hash = hash


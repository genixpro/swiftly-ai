from mongoengine import *
import datetime


class ExtractionReference(EmbeddedDocument):
    """ This class represents a reference to the location that a specific data point was extracted from. It allows the user
        to easily find where that information was extracted from in the database."""
    meta = {}

    # The appraisalId that the file is located within
    appraisalId = StringField()

    # The fileId for the document
    fileId = StringField()

    # A list of word-indexes from which the data was pulled in
    wordIndexes = ListField(IntField())

    # A list of page-numbers from which the data was pulled in
    pageNumbers = ListField(IntField())



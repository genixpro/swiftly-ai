from appraisal.components.document_generator import DocumentGenerator
import bz2
import sys
import os

from pyramid.config import Configurator
from pprint import pprint
from pymongo import MongoClient
import gridfs
import pickle

from pyramid.paster import (
    get_appsettings,
    setup_logging,
)


def main():
    # setup_logging(config_uri)
    config_uri = [part for part in sys.argv if '.ini' in part][0]
    settings = get_appsettings(config_uri)

    db = MongoClient(settings.get('db.uri'))[settings.get('db.name')]

    generator = DocumentGenerator()
    generator.generateDocument("financial_statement_1.docx", "financial_statement")



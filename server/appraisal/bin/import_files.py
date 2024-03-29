from appraisal.components.document_extractor_dataset import DocumentExtractorDataset
from appraisal.models.appraisal import Appraisal
from appraisal.models.file import File
from appraisal.models.comparable_lease import ComparableLease
from appraisal.models.comparable_sale import ComparableSale
from appraisal.models.zone import Zone
from appraisal.models.property_tag import PropertyTag
from appraisal.models.image import Image
import bz2
import sys
import os
import json as json
import os
from google.cloud import storage

from pyramid.config import Configurator
from pprint import pprint
from pymongo import MongoClient
import gridfs
import pickle
from mongoengine import connect, register_connection
from mongoengine.context_managers import switch_db
import pkg_resources
import appraisal.components.sample_data

from pyramid.paster import (
    get_appsettings,
    setup_logging,
)


def main():
    # setup_logging(config_uri)

    if len(sys.argv) < 2:
        print("You did not provide enough arguments for this command. Command is: appraisal_dump_files <environment config>")
        return

    config_uri = sys.argv[1]

    settings = get_appsettings(config_uri)

    connect(db=settings.get('db.name'), host=settings.get('db.uri'))

    files = File.objects()

    with open('files.json', 'rt') as file:
        files = json.load(file)

        for file in files:
            del file['_id']

            obj = File(**file)
            obj.save()


if __name__ == '__main__':
    main()

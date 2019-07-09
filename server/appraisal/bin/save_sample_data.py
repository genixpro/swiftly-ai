from appraisal.components.document_extractor_dataset import DocumentExtractorDataset
from appraisal.models.appraisal import Appraisal
from appraisal.models.file import File
from appraisal.models.comparable_lease import ComparableLease
from appraisal.models.comparable_sale import ComparableSale
from appraisal.models.zone import Zone
from appraisal.models.property_tag import PropertyTag
from appraisal.models.image import Image
import appraisal.components.sample_data
import bz2
import sys
import os
import json
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

from pyramid.paster import (
    get_appsettings,
    setup_logging,
)


def clearObjects(model):
    print("Clearing ", model.__name__)

    model.objects.delete()

def main():
    # setup_logging(config_uri)

    if len(sys.argv) < 2:
        print("You did not provide enough arguments for this command. Command is: appraisal_save_sample_data <environment config>")
        return

    config_uri = sys.argv[1]
    newOwner = "sample-owner"

    settings = get_appsettings(config_uri)

    sampleDataDBName = "swiftly_sample_data"
    sampleDataURI = "mongodb+srv://testing:PEpYlP1hTQ5AUEAB@swiftlyprimary-ikito.gcp.mongodb.net/swiftly_sample_data?retryWrites=true"
    sampleDataBucket = 'swiftly-sample-files'

    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = pkg_resources.resource_filename("appraisal", "gcloud-storage-key.json")

    storage_client = storage.Client()

    storageBucket = storage_client.get_bucket(settings['storage.bucket'])
    connect(db=settings.get('db.name'), host=settings.get('db.uri'))

    print("Connected to environment db, loading objects")

    data = appraisal.components.sample_data.downloadData(storageBucket)

    sampleStorageBucket = storage_client.get_bucket(sampleDataBucket)
    register_connection("target", db=sampleDataDBName, host=sampleDataURI)

    print("Connected to sample db, saving objects")

    appraisal.components.sample_data.uploadData(data, 'target', sampleStorageBucket, newOwner, settings['environment'], 'sample')





if __name__ == '__main__':
    main()

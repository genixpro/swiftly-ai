from appraisal.models.comparable_lease import ComparableLease
import bz2
import sys
import os
import json as json
import os
from google.cloud import storage
from mongoengine.queryset.visitor import Q

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

from appraisal.migrations import migrations

def main():
    # setup_logging(config_uri)

    if len(sys.argv) < 2:
        print("You did not provide enough arguments for this command. Command is: appraisal_run_migrations <environment config>")
        return

    config_uri = sys.argv[1]

    settings = get_appsettings(config_uri)

    # os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = pkg_resources.resource_filename("appraisal", "gcloud-storage-key.json")

    # storageBucket = storage_client.get_bucket(settings['storage.bucket'])

    connect(db=settings.get('db.name'), host=settings.get('db.uri'))

    for migration in migrations:
        versionNumber = migration['versionNumber']
        model = migration['model']
        func = migration['func']

        # First make sure all objects have a version number, starting at 0.
        model.objects(Q(version=None) | Q(version__exists=False)).update(version=0)

        query = Q(version__lt=versionNumber)

        objects = model.objects(query)

        count = objects.count()

        if count > 0:
            print("Running migration: ", func.__name__, "on", count, "objects")

            completed = 0

            for object in objects:
                returnObject = func(object)
                if returnObject is not None:
                    object = returnObject

                object.version = versionNumber
                object.save()

                completed += 1

                if completed % 100 == 0:
                    print("Completed migrating", completed, "objects")

            print("Completed migrating", completed, "objects")
        else:
            print("No need to run", func.__name__, "all objects already updated.")

if __name__ == '__main__':
    main()

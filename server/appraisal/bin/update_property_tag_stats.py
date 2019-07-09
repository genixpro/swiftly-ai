from appraisal.models.comparable_lease import ComparableLease
import bz2
import sys
import os
import rapidjson as json
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

    db = MongoClient(host=settings.get('db.uri'))[settings.get('db.name')]

    db['property_tag'].aggregate([
        {
            "$lookup": {
                "from": "comparables",
                "let": {"name": "$name", "owner": "$owner"},
                "pipeline": [
                    {
                        "$match":
                            {
                                "propertyTags":
                                    {
                                        "$exists": True,
                                        "$not": {"$size": 0}
                                    },
                                "$expr":
                                    {
                                        "$and":
                                            [
                                                {"$in": ["$$name", "$propertyTags"]},
                                                {"$eq": ["$$owner", "$owner"]}
                                            ]
                                    }

                            }
                    },
                    {
                        "$project": {"propertyTags": 1, "propertyType": 1, "owner": 1}
                    },
                    {
                        "$group": {"_id": "$propertyType", "v": {"$sum": 1}}
                    },
                    {
                        "$project": {"_id": 0, "k": "$_id", "v": "$v"}
                    }
                ],
                "as": "propertyTypes"
            }
        },
        {
            "$project": {"propertyTypeStats": {"$arrayToObject": "$propertyTypes"}, "name": "$name", "owner": "$owner"}
        },
        {
            "$out": "property_tag"
        }
    ])


if __name__ == '__main__':
    main()

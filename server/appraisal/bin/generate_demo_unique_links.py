from appraisal.components.document_extractor_dataset import DocumentExtractorDataset
from appraisal.models.file import File
from appraisal.models.demo_unique_link import DemoUniqueLink
import bz2
import sys
import csv
import os
import json as json
import os
from google.cloud import storage
from ..models.custom_id_field import generateNewUUID

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

    if len(sys.argv) < 3:
        print("You did not provide enough arguments for this command. Command is: appraisal_generate_demo_unique_links <environment config> <emails_csv_file>")
        return

    config_uri = sys.argv[1]

    settings = get_appsettings(config_uri)

    connect(db=settings.get('db.name'), host=settings.get('db.uri'))

    csvFile = csv.DictReader(open(sys.argv[2], 'rt'))

    newRows = []

    for row in csvFile:
        email = row['email']

        unique = DemoUniqueLink.objects(email=email).first()

        if unique is None:
            id = generateNewUUID(DemoUniqueLink, minimumLength=20)

            new = DemoUniqueLink(
                id=id,
                email=email,
                demoAccountEmail=None,
                link=settings.get('frontend.url') + "demo_activate/" + id
            )

            new.save()

            row['linkId'] = id
        else:
            row['linkId'] = unique.id

        newRows.append(row)

    outCSVFile = csv.DictWriter(open("emails-with-unique-links.csv", 'wt'), fieldnames=newRows[0].keys())

    outCSVFile.writeheader()
    outCSVFile.writerows(newRows)


if __name__ == '__main__':
    main()

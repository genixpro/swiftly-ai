import pkg_resources
import json
import os.path
from appraisal.models.appraisal import Appraisal
from mongoengine import connect
import sys

from pyramid.paster import (
    get_appsettings,
    setup_logging,
)

def main():
    # setup_logging(config_uri)
    config_uri = [part for part in sys.argv if '.ini' in part][0]
    settings = get_appsettings(config_uri)

    connect('appraisal', host=settings.get('db.uri'))

    testCaseDirectory = "tests/data"

    testCaseFiles = pkg_resources.resource_listdir("appraisal", testCaseDirectory)


    for file in testCaseFiles:
        fileStream = pkg_resources.resource_stream('appraisal', os.path.join(testCaseDirectory, file))
        appraisal = Appraisal(**json.load(fileStream))

        appraisal.save()




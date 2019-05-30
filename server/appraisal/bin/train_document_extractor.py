from appraisal.components.document_extractor import DocumentExtractor
import bz2
import sys
import os
import requests
import json

from pyramid.config import Configurator
from pprint import pprint
from pymongo import MongoClient
import gridfs
import pickle
from mongoengine import connect
import pkg_resources

from pyramid.paster import (
    get_appsettings,
    setup_logging,
)

import google.cloud.client
from google.cloud import _http
class Connection(_http.JSONConnection):
    """A connection to Google Cloud Storage via the JSON REST API.

    :type client: :class:`~google.cloud.storage.client.Client`
    :param client: The client that owns the current connection.
    """

    API_BASE_URL = "https://cloudbuild.googleapis.com/v1"
    """The base of the API call URL."""

    API_VERSION = "v1"
    """The version of the API, used in building the API call's URL."""

    API_URL_TEMPLATE = "{api_base_url}/{path}"
    """A template for the URL of a particular API call."""


class TriggerClient(google.cloud.client.ClientWithProject):

    SCOPE = (
        "https://www.googleapis.com/auth/cloud-platform",
    )
    """The scopes required for authenticating as a Cloud Storage consumer."""

    def __init__(self):
        super(TriggerClient, self).__init__(project="appraisalai", credentials=None, _http=None)
        self._connection = Connection(self)


def triggerRebuild(environment, triggerId):
    branchName = "release"

    if environment == 'testing':
        branchName = "master"

    data = {"branchName": branchName}

    client = TriggerClient()

    api_response = client._connection.api_request(
        method="POST",
        path=f"projects/appraisalai/triggers/{triggerId}:run",
        data=json.dumps(data),
        content_type="application/json",
        # headers=client._connection._encryption_headers(),
        _target_object=client
    )


def main():
    # setup_logging(config_uri)
    config_uri = [part for part in sys.argv if '.ini' in part][0]
    settings = get_appsettings(config_uri)

    db = MongoClient(settings.get('db.uri'))[settings.get('db.name')]

    connect('appraisal', host=settings.get('db.uri'))

    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = pkg_resources.resource_filename("appraisal", "gcloud-storage-key.json")

    vectorServerURL = settings.get('vectorServerURL')

    classifier = DocumentExtractor(db, vectorServerURL)
    classifier.trainAlgorithm()

    triggerRebuild("sandbox", "4b7493de-9a42-4665-802f-e83014644276")
    triggerRebuild("demo", "f7669f8d-9920-48af-9d0d-de0af853cc8b")
    triggerRebuild("production", "f3d1b42b-1f92-4159-b073-925f66df9056")
    triggerRebuild("testing", "2e790270-2307-419c-86d6-49970cc29ce6")



if __name__ == '__main__':
    main()
from cornice.resource import resource
from pyramid.security import Authenticated
from pyramid.httpexceptions import HTTPTemporaryRedirect
from pyramid.authorization import Allow, Deny, Everyone
import pkg_resources
import requests
from auth0.v3.authentication import GetToken
import uuid
import appraisal.components.sample_data
import os
import json
import urllib.parse
from google.cloud import storage
from mongoengine import connect, register_connection


def loadSampleDataForDemos():
    global globalSampleData
    sampleDataDBName = "swiftly_sample_data"
    sampleDataURI = "mongodb+srv://testing:PEpYlP1hTQ5AUEAB@swiftlyprimary-ikito.gcp.mongodb.net/swiftly_sample_data?retryWrites=true"
    sampleDataBucket = 'swiftly-sample-files'

    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = pkg_resources.resource_filename("appraisal",
                                                                                   "gcloud-storage-key.json")

    storage_client = storage.Client()
    sampleStorageBucket = storage_client.get_bucket(sampleDataBucket)

    register_connection("sample", db=sampleDataDBName, host=sampleDataURI)
    globalSampleData = appraisal.components.sample_data.downloadData(sampleStorageBucket, "sample")



@resource(path='/demo_activate', renderer='bson', cors_enabled=True, cors_origins="*", permission="everything")
class DemoLaunch(object):

    def __init__(self, request, context=None):
        domain = 'swiftlyai.auth0.com'
        non_interactive_client_id = request.registry.auth0MgmtClientID
        non_interactive_client_secret = request.registry.auth0MgmtSecret

        get_token = GetToken(domain)
        token = get_token.client_credentials(non_interactive_client_id, non_interactive_client_secret,
                                             'https://{}/api/v2/'.format(domain))

        self.mgmt_api_token = token['access_token']
        self.request = request

    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Allow, Everyone, 'everything')
        ]

    def get(self):
        username = uuid.uuid4().hex + "@swiftlyai.com"
        password = "demo123$$"

        response = requests.post("https://swiftlyai.auth0.com/api/v2/users", headers={
            "Authorization": "Bearer " + self.mgmt_api_token
        }, json={
            "connection": "Username-Password-Authentication",
            "email": username,
            "password": password
        })

        owner = response.json()['user_id']

        appraisal.components.sample_data.uploadData(globalSampleData, 'default', self.request.registry.storageBucket, owner, 'sample', self.request.registry.environment)

        response = requests.post("https://swiftlyai.auth0.com/oauth/token", headers={
            # "Authorization": "Bearer " + self.mgmt_api_token
        }, json={
            "grant_type": "password",
            "client_id": self.request.registry.auth0ClientID,
            "audience": self.request.registry.apiUrl,
            "scope": "openid",
            "username": username,
            "password": password,
            "connection": "Username-Password-Authentication"
        })

        frontendUrl = self.request.registry.frontendUrl

        frontendUrl += "rapidauth?" + urllib.parse.urlencode({"rapidauth": response.content})

        return HTTPTemporaryRedirect(location=frontendUrl)

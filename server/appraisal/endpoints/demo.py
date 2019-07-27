from cornice.resource import resource
from pyramid.security import Authenticated
from pyramid.httpexceptions import HTTPTemporaryRedirect, HTTPForbidden
from pyramid.authorization import Allow, Deny, Everyone
import pkg_resources
import requests
from auth0.v3.authentication import GetToken
import uuid
import appraisal.components.sample_data
import os
import json
import threading
import urllib.parse
from google.cloud import storage
from mongoengine import connect, register_connection
from appraisal.models.demo_account import DemoAccount
from appraisal.models.demo_unique_link import DemoUniqueLink
from ..models.custom_id_field import generateNewUUID, regularizeID


@resource(collection_get='/demo_activate/', path='/demo_activate/{linkId}', renderer='bson', cors_enabled=True, cors_origins="*", permission="everything")
class DemoLaunch(object):

    def __init__(self, request, context=None):
        self.request = request

    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Allow, Everyone, 'everything')
        ]

    def collection_get(self):
        self.get()

    def get(self):
        global globalThread

        if not self.request.registry.allowRapidDemo:
            return HTTPForbidden()

        linkId = self.request.matchdict.get('linkId', '')

        demoAccount = None
        if linkId:
            demoAccount = DemoAccount.objects(uniqueLinkId=linkId).first()

        if demoAccount is None:
            uniqueLink = DemoUniqueLink.objects(id=str(linkId)).first()
            if uniqueLink is None:
                uniqueLink = DemoUniqueLink(email='demo@swiftlyai.com')

            demoAccount = DemoAccount.objects(used=False).first()
            if demoAccount is None:
                demoAccount = createDemoAccountData(self.request.registry)
            demoAccount.used = True
            demoAccount.uniqueLinkId = linkId
            demoAccount.uniqueEmail = uniqueLink.email
            demoAccount.save()

            uniqueLink.demoAccountEmail = demoAccount.email
            uniqueLink.save()

            domain = 'swiftlyai.auth0.com'
            non_interactive_client_id = self.request.registry.auth0MgmtClientID
            non_interactive_client_secret = self.request.registry.auth0MgmtSecret

            get_token = GetToken(domain)
            token = get_token.client_credentials(non_interactive_client_id,
                                                 non_interactive_client_secret,
                                                 'https://{}/api/v2/'.format(domain))

            mgmt_api_token = token['access_token']

            response = requests.patch(f"https://swiftlyai.auth0.com/api/v2/users/{demoAccount.owner}", headers={
                "Authorization": "Bearer " + mgmt_api_token
            }, json={
                "app_metadata": {
                    "demoLinkEmail": demoAccount.uniqueEmail
                }
            })

        response = requests.post("https://swiftlyai.auth0.com/oauth/token", headers={
            # "Authorization": "Bearer " + self.mgmt_api_token
        }, json={
            "grant_type": "password",
            "client_id": self.request.registry.auth0ClientID,
            "audience": self.request.registry.apiUrl.replace("https://", "http://"),
            "scope": "openid email profile",
            "username": demoAccount.email,
            "password": demoAccount.password,
            "connection": "Username-Password-Authentication"
        })

        frontendUrl = self.request.registry.frontendUrl

        frontendUrl += "rapidauth?" + urllib.parse.urlencode({"rapidauth": response.content})

        # This is a cheap hack, we should be using a background queuing system
        # If we don't offload it, it will hurt response time
        globalThread = threading.Thread(target=createDemoAccountsIfNeeded, args=[self.request.registry]).start()

        return HTTPTemporaryRedirect(location=frontendUrl)

def createDemoAccountsIfNeeded(registry):
    existing = DemoAccount.objects(used=False).count()

    needed = max(0, 5 - existing)

    for n in range(needed):
        createDemoAccountData(registry)

def createDemoAccountData(registry):
    sampleDataDBName = "swiftly_sample_data"
    sampleDataURI = "mongodb+srv://testing:PEpYlP1hTQ5AUEAB@swiftlyprimary-ikito.gcp.mongodb.net/swiftly_sample_data?retryWrites=true"
    sampleDataBucket = 'swiftly-sample-files'

    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = pkg_resources.resource_filename("appraisal",
                                                                                   "gcloud-storage-key.json")

    storage_client = storage.Client()
    sampleStorageBucket = storage_client.get_bucket(sampleDataBucket)

    register_connection("sample", db=sampleDataDBName, host=sampleDataURI)
    sampleData = appraisal.components.sample_data.downloadData(sampleStorageBucket, "sample")


    domain = 'swiftlyai.auth0.com'
    non_interactive_client_id = registry.auth0MgmtClientID
    non_interactive_client_secret = registry.auth0MgmtSecret

    get_token = GetToken(domain)
    token = get_token.client_credentials(non_interactive_client_id, non_interactive_client_secret,
                                         'https://{}/api/v2/'.format(domain))

    mgmt_api_token = token['access_token']

    email = uuid.uuid4().hex + "@swiftlyai.com"
    password = "demo123$$" + uuid.uuid4().hex

    response = requests.post("https://swiftlyai.auth0.com/api/v2/users", headers={
        "Authorization": "Bearer " + mgmt_api_token
    }, json={
        "connection": "Username-Password-Authentication",
        "email": email,
        "password": password
    })

    owner = response.json()['user_id']

    appraisal.components.sample_data.uploadData(sampleData, 'default', registry.storageBucket,
                                                owner, 'sample', registry.environment)
    
    demoAccount = DemoAccount(
        email=email,
        password=password,
        owner=owner,
        used=False
    )

    demoAccount.id = generateNewUUID(DemoAccount)

    demoAccount.save()

    return demoAccount

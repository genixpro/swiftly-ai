from cornice.resource import resource
from appraisal.models.image import Image
from pyramid.security import Authenticated
from pyramid.authorization import Allow, Deny, Everyone
from appraisal.authorization import checkUserOwnsObject
from pyramid.httpexceptions import HTTPForbidden
from pyramid.response import Response
import google.api_core.exceptions
import requests
from ..models.custom_id_field import generateNewUUID, regularizeID

from functools import lru_cache
@lru_cache(maxsize=4096)
def proxyFetch(url):
    response = requests.get(url)
    return response.content


@resource(path='/proxy', renderer='bson', cors_enabled=True, cors_origins="*", permission="everything")
class ProxyAPI(object):
    def __init__(self, request, context=None):
        self.request = request

    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Allow, Everyone, 'everything')
        ]

    def get(self):
        # TODO: WE NEED SOME FORM OF AUTH ON THIS ENDPOINT.
        # TODO: ALLOWING OPEN ENDED PROXY WILL GET US ABUSED
        # URL to proxy fetch
        url = self.request.GET['url']

        data = proxyFetch(url)

        print(url)

        return Response(body=data)





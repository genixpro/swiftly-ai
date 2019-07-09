from cornice.resource import resource
import bson
import rapidjson as json
from pyramid.security import Authenticated
from pyramid.authorization import Allow, Deny, Everyone
from appraisal.authorization import checkUserOwnsObject
from pyramid.httpexceptions import HTTPForbidden
from ..models.custom_id_field import generateNewUUID, regularizeID

@resource(path='/home', renderer='bson', cors_enabled=True, cors_origins="*", permission="everything")
class HomeAPI(object):

    def __init__(self, request, context=None):
        self.request = request

    def __acl__(self):
        return [
            (Allow, Everyone, 'everything')
        ]

    def get(self):
        return {"status": "ok"}




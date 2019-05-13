from cornice.resource import resource
import bson
import json
from pyramid.security import Authenticated
from pyramid.authorization import Allow, Deny, Everyone
from appraisal.authorization import checkUserOwnsObject
from pyramid.httpexceptions import HTTPForbidden

@resource(path='/home', renderer='bson', cors_enabled=True, cors_origins="*", permission="everything")
class HomeAPI(object):

    def __init__(self, request, context=None):
        self.request = request

    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]

    def get(self):
        return {"status": "ok"}




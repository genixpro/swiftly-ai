from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
import pymongo
import bson
from appraisal.models.property_tag import PropertyTag
import tempfile
import subprocess
import os
import json
from pyramid.security import Authenticated
from pyramid.authorization import Allow, Deny, Everyone
from appraisal.authorization import checkUserOwnsObject
from pyramid.httpexceptions import HTTPForbidden


@resource(collection_path='/property_tags', path='/property_tags/{id}', renderer='bson', cors_enabled=True, cors_origins="*", permission="everything")
class PropertyTagAPI(object):

    def __init__(self, request, context=None):
        self.request = request


    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]

    def collection_get(self):
        query = {}

        if "name" in self.request.GET:
            query['name__icontains'] = self.request.GET['name']

        if "propertyType" in self.request.GET:
            query['propertyType'] = self.request.GET['propertyType']

        if "view_all" not in self.request.effective_principals:
            query["owner"] = self.request.authenticated_userid

        propertyTags = PropertyTag.objects(**query).limit(10)

        return {"tags": list([json.loads(propertyTag.to_json()) for propertyTag in propertyTags])}

    def get(self):
        propertyTagId = self.request.matchdict['id']

        propertyTag = PropertyTag.objects(id=propertyTagId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, propertyTag)
        if not auth:
            raise HTTPForbidden("You do not have access to this property tag")

        return {"tag": json.loads(propertyTag.to_json())}

    def collection_post(self):
        data = self.request.json_body

        data["owner"] = self.request.authenticated_userid

        propertyTag = PropertyTag(**data)
        propertyTag.save()

        return {"_id": str(propertyTag.id)}


    def post(self):
        data = self.request.json_body

        propertyTagId = self.request.matchdict['id']

        if '_id' in data:
            del data['_id']

        propertyTag = PropertyTag.objects(id=propertyTagId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, propertyTag)
        if not auth:
            raise HTTPForbidden("You do not have access to this property tag")

        propertyTag.modify(**data)

        propertyTag.save()

        return {"_id": str(propertyTagId)}

    def delete(self):
        propertyTagId = self.request.matchdict['id']

        propertyTag = PropertyTag.objects(id=propertyTagId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, propertyTag)
        if not auth:
            raise HTTPForbidden("You do not have access to this property tag")

        propertyTag.delete()



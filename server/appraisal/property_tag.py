from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
import pymongo
import bson
from .models.property_tag import PropertyTag
import tempfile
import subprocess
import os
import json


@resource(collection_path='/property_tags', path='/property_tag/{id}', renderer='bson', cors_enabled=True, cors_origins="*")
class PropertyTagAPI(object):

    def __init__(self, request, context=None):
        self.request = request


    def __acl__(self):
        return [(Allow, Everyone, 'everything')]

    def collection_get(self):
        query = {}

        if "name" in self.request.GET:
            query['name__icontains'] = self.request.GET['name']

        propertyTags = PropertyTag.objects(**query).limit(10)

        return {"tags": list([json.loads(propertyTag.to_json()) for propertyTag in propertyTags])}

    def get(self):
        propertyTagId = self.request.matchdict['id']

        propertyTag = PropertyTag.objects(id=propertyTagId).first()

        return {"tag": json.loads(propertyTag.to_json())}

    def collection_post(self):
        data = self.request.json_body

        propertyTag = PropertyTag(**data)
        propertyTag.save()

        return {"_id": str(propertyTag.id)}


    def post(self):
        data = self.request.json_body

        propertyTagId = self.request.matchdict['id']

        if '_id' in data:
            del data['_id']

        propertyTag = PropertyTag.objects(id=propertyTagId).first()
        propertyTag.modify(**data)

        propertyTag.save()

        return {"_id": str(propertyTagId)}

    def delete(self):
        propertyTagId = self.request.matchdict['id']

        propertyTag = PropertyTag.objects(id=propertyTagId).first()
        propertyTag.delete()



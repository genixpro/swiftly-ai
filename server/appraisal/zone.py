from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
import pymongo
import bson
from .models.zone import Zone
import tempfile
import subprocess
import os
import json


@resource(collection_path='/zones', path='/zone/{id}', renderer='bson', cors_enabled=True, cors_origins="*")
class ZoneAPI(object):

    def __init__(self, request, context=None):
        self.request = request


    def __acl__(self):
        return [(Allow, Everyone, 'everything')]

    def collection_get(self):
        query = {}

        if "zoneName" in self.request.GET:
            query['zoneName__icontains'] = self.request.GET['zoneName']

        zones = Zone.objects(**query)

        return {"zones": list([json.loads(zone.to_json()) for zone in zones])}

    def get(self):
        zoneId = self.request.matchdict['id']

        zone = Zone.objects(id=zoneId).first()

        return {"zone": json.loads(zone.to_json())}

    def collection_post(self):
        data = self.request.json_body

        zone = Zone(**data)
        zone.save()

        return {"_id": str(zone.id)}


    def post(self):
        data = self.request.json_body

        zoneId = self.request.matchdict['id']

        if '_id' in data:
            del data['_id']

        zone = Zone.objects(id=zoneId).first()
        zone.modify(**data)

        zone.save()

        return {"_id": str(zoneId)}

    def delete(self):
        zoneId = self.request.matchdict['id']

        zone = Zone.objects(id=zoneId).first()
        zone.delete()



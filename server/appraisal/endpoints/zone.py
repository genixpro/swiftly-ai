from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
import pymongo
import bson
from appraisal.models.zone import Zone
import tempfile
import subprocess
import os
import json
from pyramid.security import Authenticated
from pyramid.authorization import Allow, Deny, Everyone
from appraisal.authorization import checkUserOwnsObject
from pyramid.httpexceptions import HTTPForbidden
from ..models.custom_id_field import generateNewUUID, regularizeID


@resource(collection_path='/zones', path='/zone/{id}', renderer='bson', cors_enabled=True, cors_origins="*", permission="everything")
class ZoneAPI(object):

    def __init__(self, request, context=None):
        self.request = request


    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]

    def collection_get(self):
        query = {}

        if "zoneName" in self.request.GET:
            query['zoneName__icontains'] = self.request.GET['zoneName']

        if "view_all" not in self.request.effective_principals:
            query["owner"] = self.request.authenticated_userid

        zones = Zone.objects(**query)

        return {"zones": list([json.loads(zone.to_json()) for zone in zones])}

    def get(self):
        zoneId = self.request.matchdict['id']

        zone = Zone.objects(id=regularizeID(zoneId)).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, zone)
        if not auth:
            raise HTTPForbidden("You do not have access to this zone")

        return {"zone": json.loads(zone.to_json())}

    def collection_post(self):
        data = self.request.json_body
        data['owner'] = self.request.authenticated_userid
        data['id'] = generateNewUUID(Zone)

        zone = Zone(**data)
        zone.save()

        return {"_id": str(zone.id)}


    def post(self):
        data = self.request.json_body

        zoneId = self.request.matchdict['id']

        if '_id' in data:
            del data['_id']

        zone = Zone.objects(id=regularizeID(zoneId)).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, zone)
        if not auth:
            raise HTTPForbidden("You do not have access to this zone")

        zone.modify(**data)

        zone.save()

        return {"_id": str(zoneId)}

    def delete(self):
        zoneId = self.request.matchdict['id']

        zone = Zone.objects(id=regularizeID(zoneId)).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, zone)
        if not auth:
            raise HTTPForbidden("You do not have access to this zone")

        zone.delete()



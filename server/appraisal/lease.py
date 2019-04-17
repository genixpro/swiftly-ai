from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
import pymongo
import bson
import tempfile
import subprocess
import os
from pyramid.security import Authenticated
from pyramid.authorization import Allow, Deny, Everyone


@resource(collection_path='/appraisal/{appraisalId}/leases', path='/appraisal/{appraisalId}/leases/{id}', renderer='bson', cors_enabled=True, cors_origins="*", permission="everything")
class LeaseAPI(object):

    def __init__(self, request, context=None):
        self.request = request
        self.leasesCollection = request.registry.db['leases']

    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]

    def collection_get(self):
        appraisalId = self.request.matchdict['appraisalId']

        leases = self.leasesCollection.find({"appraisalId": appraisalId}, {"fileName": 1, "extractedData": 1, "pricePerSquareFoot": 1, "size": 1, "monthlyRent": 1})

        return {"leases": list(leases)}

    def get(self):
        appraisalId = self.request.matchdict['appraisalId']
        leaseId = self.request.matchdict['id']

        lease = self.leasesCollection.find_one({"_id": bson.ObjectId(leaseId), "appraisalId": appraisalId})

        return {"lease": lease}

    def collection_post(self):
        data = self.request.json_body

        appraisalId = self.request.matchdict['appraisalId']
        data["appraisalId"] = appraisalId

        result = self.leasesCollection.insert_one(data)

        id = result.inserted_id
        return {"_id": str(id)}




    def post(self):
        data = self.request.json_body

        appraisalId = self.request.matchdict['appraisalId']
        leaseId = self.request.matchdict['id']

        if '_id' in data:
            del data['_id']

        self.leasesCollection.update_one({"_id": bson.ObjectId(leaseId)}, {"$set": data})

        return {"_id": str(id)}




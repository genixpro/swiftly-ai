from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
import pymongo
import bson
import tempfile
import subprocess
import os


@resource(collection_path='/appraisal/{appraisalId}/comparable_sales', path='/appraisal/{appraisalId}/comparable_sales/{id}', renderer='bson', cors_enabled=True, cors_origins="*")
class ComparableSaleAPI(object):

    def __init__(self, request, context=None):
        self.request = request
        self.comparableSalesCollection = request.registry.db['comparable_sales']
        self.appraisalsCollection = request.registry.db['appraisals']

    def __acl__(self):
        return [(Allow, Everyone, 'everything')]

    def collection_get(self):
        appraisalId = self.request.matchdict['appraisalId']

        comparable_sales = self.comparableSalesCollection.find({"appraisalId": appraisalId})

        return {"comparableSales": list(comparable_sales)}

    def get(self):
        appraisalId = self.request.matchdict['appraisalId']
        leaseId = self.request.matchdict['id']

        comparableSale = self.comparableSalesCollection.find_one({"_id": bson.ObjectId(leaseId), "appraisalId": appraisalId})

        return {"comparableSale": comparableSale}

    def collection_post(self):
        data = self.request.json_body

        appraisalId = self.request.matchdict['appraisalId']
        data["appraisalId"] = appraisalId

        result = self.comparableSalesCollection.insert_one(data)

        id = result.inserted_id
        return {"_id": str(id)}


    def post(self):
        data = self.request.json_body

        appraisalId = self.request.matchdict['appraisalId']
        statementId = self.request.matchdict['id']

        if '_id' in data:
            del data['_id']

        self.comparableSalesCollection.update_one({"_id": bson.ObjectId(statementId)}, {"$set": data})

        return {"_id": str(id)}

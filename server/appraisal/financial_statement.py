from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
from webob_graphql import serve_graphql_request
import pymongo
import bson
import tempfile
import subprocess
import os


@resource(collection_path='/appraisal/{appraisalId}/financial_statements', path='/appraisal/{appraisalId}/financial_statements/{id}', renderer='bson', cors_enabled=True, cors_origins="*")
class FinancialStatementAPI(object):

    def __init__(self, request, context=None):
        self.request = request
        self.financialStatementsCollection = request.registry.db['financial_statements']

    def __acl__(self):
        return [(Allow, Everyone, 'everything')]

    def collection_get(self):
        appraisalId = self.request.matchdict['appraisalId']

        financial_statements = self.financialStatementsCollection.find({"appraisalId": appraisalId})

        return {"financial_statements": list(financial_statements)}

    def get(self):
        appraisalId = self.request.matchdict['appraisalId']
        leaseId = self.request.matchdict['id']

        financial_statement = self.financialStatementsCollection.find_one({"_id": bson.ObjectId(leaseId), "appraisalId": appraisalId})

        return {"financialStatement": financial_statement}

    def collection_post(self):
        data = self.request.json_body

        appraisalId = self.request.matchdict['appraisalId']
        data["appraisalId"] = appraisalId

        result = self.financialStatementsCollection.insert_one(data)

        id = result.inserted_id
        return {"_id": str(id)}


    def post(self):
        data = self.request.json_body

        appraisalId = self.request.matchdict['appraisalId']
        statementId = self.request.matchdict['id']

        if '_id' in data:
            del data['_id']

        self.financialStatementsCollection.update_one({"_id": bson.ObjectId(statementId)}, {"$set": data})

        return {"_id": str(id)}





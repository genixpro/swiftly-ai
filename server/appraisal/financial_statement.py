from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
import pymongo
import bson
import tempfile
import subprocess
import os
from pyramid.security import Authenticated
from pyramid.authorization import Allow, Deny, Everyone
from appraisal.authorization import checkUserOwnsObject
from pyramid.httpexceptions import HTTPForbidden


@resource(collection_path='/appraisal/{appraisalId}/financial_statements', path='/appraisal/{appraisalId}/financial_statements/{id}', renderer='bson', cors_enabled=True, cors_origins="*", permission="everything")
class FinancialStatementAPI(object):

    def __init__(self, request, context=None):
        self.request = request
        self.financialStatementsCollection = request.registry.db['financial_statements']
        self.appraisalsCollection = request.registry.db['appraisals']

    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]

    def collection_get(self):
        appraisalId = self.request.matchdict['appraisalId']

        query = {"appraisalId": appraisalId}

        if "admin" not in self.request.effective_principals:
            query["owner"] = self.request.authenticated_userid

        financial_statements = self.financialStatementsCollection.find(query)

        return {"financial_statements": list(financial_statements)}

    def get(self):
        appraisalId = self.request.matchdict['appraisalId']
        leaseId = self.request.matchdict['id']

        financial_statement = self.financialStatementsCollection.find_one({"_id": bson.ObjectId(leaseId), "appraisalId": appraisalId})

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, financial_statement)
        if not auth:
            raise HTTPForbidden("You do not have access to this file.")

        return {"financialStatement": financial_statement}

    def collection_post(self):
        data = self.request.json_body

        appraisalId = self.request.matchdict['appraisalId']
        data["appraisalId"] = appraisalId
        data['owner'] = self.request.authenticated_userid

        result = self.financialStatementsCollection.insert_one(data)

        id = result.inserted_id
        return {"_id": str(id)}


    def post(self):
        data = self.request.json_body

        appraisalId = self.request.matchdict['appraisalId']
        statementId = self.request.matchdict['id']

        if '_id' in data:
            del data['_id']

        self.financialStatementsCollection.update_one({"_id": bson.ObjectId(statementId), "owner": self.request.authenticated_userid}, {"$set": data})

        self.updateStabilizedStatement(appraisalId)

        return {"_id": str(id)}

    def updateStabilizedStatement(self, appraisalId):
        financialStatements = self.financialStatementsCollection.find({"appraisalId": appraisalId, "owner": self.request.authenticated_userid})

        expenses = []
        incomes = []

        for statement in financialStatements:
            incomes = statement.get('extractedData', {}).get('income', [])
            expenses = statement.get('extractedData', {}).get('expense', [])

        for income in incomes:
            if 'include' not in income:
                income['include'] = True
        for expense in expenses:
            if 'include' not in expense:
                expense['include'] = True

        extractedData = {
            "income": incomes,
            "expense": expenses
        }

        changed = self.appraisalsCollection.update_one({"_id": bson.ObjectId(appraisalId)}, {"$set": {"stabilizedStatement": extractedData}})


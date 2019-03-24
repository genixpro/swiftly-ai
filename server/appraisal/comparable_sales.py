from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
import pymongo
import bson
import tempfile
import subprocess
import json
import os
from .models.comparable_sale import ComparableSale

@resource(collection_path='/comparable_sales', path='/comparable_sales/{id}', renderer='bson', cors_enabled=True, cors_origins="*")
class ComparableSaleAPI(object):

    def __init__(self, request, context=None):
        self.request = request

    def __acl__(self):
        return [(Allow, Everyone, 'everything')]

    def collection_get(self):
        query = self.request.GET

        comparableSales = ComparableSale.objects(**query)

        return {"comparableSales": list([json.loads(sale.to_json()) for sale in comparableSales])}

    def get(self):
        comparableId = self.request.matchdict['id']

        comparableSale = ComparableSale.objects(id=comparableId).first()

        return {"comparableSale": json.loads(comparableSale.to_json())}

    def collection_post(self):
        data = self.request.json_body

        comparable = ComparableSale(**data)
        comparable.save()

        return {"_id": str(comparable.id)}


    def post(self):
        data = self.request.json_body

        comparableId = self.request.matchdict['id']

        if '_id' in data:
            del data['_id']

        comparable = ComparableSale.objects(id=comparableId).first()
        comparable.modify(**data)

        comparable.save()

        return {"_id": str(comparableId)}

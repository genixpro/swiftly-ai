from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
import pymongo
import bson
import tempfile
import subprocess
import json
import os
from .models.comparable_lease import ComparableLease

@resource(collection_path='/comparable_leases', path='/comparable_leases/{id}', renderer='bson', cors_enabled=True, cors_origins="*")
class ComparableLeaseAPI(object):

    def __init__(self, request, context=None):
        self.request = request

    def __acl__(self):
        return [(Allow, Everyone, 'everything')]

    def collection_get(self):
        query = {}
        if 'sizeOfUnitFrom' in self.request.GET:
            query['sizeOfUnit__gt'] = self.request.GET['sizeOfUnitFrom']
        if 'sizeOfUnitTo' in self.request.GET:
            query['sizeOfUnit__lt'] = self.request.GET['sizeOfUnitTo']
        if 'yearlyRentFrom' in self.request.GET:
            query['yearlyRent__gt'] = self.request.GET['yearlyRentFrom']
        if 'yearlyRentTo' in self.request.GET:
            query['yearlyRent__lt'] = self.request.GET['yearlyRentTo']
        if 'leaseDateFrom' in self.request.GET:
            query['leaseDate__gt'] = self.request.GET['leaseDateFrom']
        if 'leaseDateTo' in self.request.GET:
            query['leaseDate__lt'] = self.request.GET['leaseDateTo']
        if 'propertyType' in self.request.GET:
            query['propertyType'] = self.request.GET['propertyType']
        if 'tenantName' in self.request.GET:
            query['tenantName__contains'] = self.request.GET['tenantName']

        if 'propertyTags[]' in self.request.GET:
            query['propertyTags__all'] = [value for key, value in self.request.GET.items() if key == 'propertyTags[]']

        if 'locationTop' in self.request.GET:
            query['location__geo_within_box'] = [
                (float(self.request.GET['locationLeft']), float(self.request.GET['locationBottom'])),
                (float(self.request.GET['locationRight']), float(self.request.GET['locationTop']))
            ]

        comparableLeases = ComparableLease.objects(**query)

        return {"comparableLeases": list([json.loads(sale.to_json()) for sale in comparableLeases])}

    def get(self):
        comparableId = self.request.matchdict['id']

        comparableLease = ComparableLease.objects(id=comparableId).first()

        return {"comparableLease": json.loads(comparableLease.to_json())}

    def collection_post(self):
        data = self.request.json_body

        comparable = ComparableLease(**data)
        comparable.save()

        return {"_id": str(comparable.id)}


    def post(self):
        data = self.request.json_body

        comparableId = self.request.matchdict['id']

        if '_id' in data:
            del data['_id']

        comparable = ComparableLease.objects(id=comparableId).first()
        comparable.modify(**data)

        comparable.save()

        return {"_id": str(comparableId)}

    def delete(self):
        fileId = self.request.matchdict['id']

        sale = ComparableLease.objects(id=fileId).first()
        sale.delete()

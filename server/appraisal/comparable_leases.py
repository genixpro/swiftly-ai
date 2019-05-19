from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
import pymongo
import bson
import tempfile
import subprocess
import json
import os
from appraisal.models.comparable_lease import ComparableLease
from pyramid.security import Authenticated
from pyramid.authorization import Allow, Deny, Everyone
from appraisal.authorization import checkUserOwnsObject
from pyramid.httpexceptions import HTTPForbidden

@resource(collection_path='/comparable_leases', path='/comparable_leases/{id}', renderer='bson', cors_enabled=True, cors_origins="*", permission="everything")
class ComparableLeaseAPI(object):

    def __init__(self, request, context=None):
        self.request = request


    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]

    def collection_get(self):
        query = {}
        if 'sizeOfUnitFrom' in self.request.GET:
            query['sizeOfUnit__gte'] = self.request.GET['sizeOfUnitFrom']
        if 'sizeOfUnitTo' in self.request.GET:
            query['sizeOfUnit__lte'] = self.request.GET['sizeOfUnitTo']
        if 'yearlyRentFrom' in self.request.GET:
            query['rentEscalations__0__yearlyRent__gte'] = self.request.GET['yearlyRentFrom']
        if 'yearlyRentTo' in self.request.GET:
            query['rentEscalations__0__yearlyRent__lte'] = self.request.GET['yearlyRentTo']
        if 'leaseDateFrom' in self.request.GET:
            query['leaseDate__gte'] = self.request.GET['leaseDateFrom']
        if 'leaseDateTo' in self.request.GET:
            query['leaseDate__lte'] = self.request.GET['leaseDateTo']

        if 'taxesMaintenanceInsuranceFrom' in self.request.GET:
            query['taxesMaintenanceInsurance__gte'] = self.request.GET['taxesMaintenanceInsuranceFrom']
        if 'taxesMaintenanceInsuranceTo' in self.request.GET:
            query['taxesMaintenanceInsurance__lte'] = self.request.GET['taxesMaintenanceInsuranceTo']

        if 'propertyType' in self.request.GET:
            query['propertyType'] = self.request.GET['propertyType']
        if 'tenantName' in self.request.GET:
            query['tenantName__contains'] = self.request.GET['tenantName']
        if 'tenancyType' in self.request.GET:
            query['tenancyType'] = self.request.GET['tenancyType']

        if 'propertyTags[]' in self.request.GET:
            query['propertyTags__all'] = [value for key, value in self.request.GET.items() if key == 'propertyTags[]']

        if 'locationTop' in self.request.GET:
            query['location__geo_within_box'] = [
                (float(self.request.GET['locationLeft']), float(self.request.GET['locationBottom'])),
                (float(self.request.GET['locationRight']), float(self.request.GET['locationTop']))
            ]


        if "view_all" not in self.request.effective_principals:
            query["owner"] = self.request.authenticated_userid

        comparableLeases = ComparableLease.objects(**query)

        if 'sort' in self.request.GET:
            comparableLeases = comparableLeases.order_by(self.request.GET['sort'])

        return {"comparableLeases": list([json.loads(sale.to_json()) for sale in comparableLeases])}

    def get(self):
        comparableId = self.request.matchdict['id']

        comparableLease = ComparableLease.objects(id=comparableId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, comparableLease)
        if not auth:
            raise HTTPForbidden("You do not have access to this comparable lease.")

        return {"comparableLease": json.loads(comparableLease.to_json())}

    def collection_post(self):
        data = self.request.json_body

        data['owner'] = self.request.authenticated_userid

        comparable = ComparableLease(**data)
        comparable.save()

        return {"_id": str(comparable.id)}


    def post(self):
        data = self.request.json_body

        comparableId = self.request.matchdict['id']

        if '_id' in data:
            del data['_id']

        comparable = ComparableLease.objects(id=comparableId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, comparable)
        if not auth:
            raise HTTPForbidden("You do not have access to this comparable lease.")

        comparable.modify(**data)

        comparable.save()

        return {"_id": str(comparableId)}

    def delete(self):
        fileId = self.request.matchdict['id']

        comparable = ComparableLease.objects(id=fileId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, comparable)
        if not auth:
            raise HTTPForbidden("You do not have access to this comparable lease.")

            comparable.delete()

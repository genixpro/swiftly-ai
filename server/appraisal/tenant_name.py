from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
import pymongo
import bson
from appraisal.models.comparable_lease import ComparableLease
import tempfile
import subprocess
import os
import json
from pyramid.security import Authenticated
from pyramid.authorization import Allow, Deny, Everyone
from appraisal.authorization import checkUserOwnsObject
from pyramid.httpexceptions import HTTPForbidden


@resource(path='/tenant_names', renderer='bson', cors_enabled=True, cors_origins="*", permission="everything")
class TenantNameAPI(object):

    def __init__(self, request, context=None):
        self.request = request


    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]

    def get(self):
        query = {}

        if "tenantName" in self.request.GET:
            query['tenantName__icontains'] = self.request.GET['tenantName']

        if "view_all" not in self.request.effective_principals:
            query["owner"] = self.request.authenticated_userid

        leases = ComparableLease.objects(**query).only('tenantName')

        return {"names": sorted(list(set([lease.tenantName for lease in leases])))}


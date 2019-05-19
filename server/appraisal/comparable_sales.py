from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
import pymongo
import bson
import tempfile
import subprocess
import json
import os
from appraisal.models.comparable_sale import ComparableSale
from pyramid.security import Authenticated
from pyramid.authorization import Allow, Deny, Everyone
from appraisal.authorization import checkUserOwnsObject
from pyramid.httpexceptions import HTTPForbidden

@resource(collection_path='/comparable_sales', path='/comparable_sales/{id}', renderer='bson', cors_enabled=True, cors_origins="*", permission="everything")
class ComparableSaleAPI(object):

    def __init__(self, request, context=None):
        self.request = request


    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]

    def collection_get(self):
        query = {}
        if 'salePriceFrom' in self.request.GET:
            query['salePrice__gte'] = self.request.GET['salePriceFrom']
        if 'salePriceTo' in self.request.GET:
            query['salePrice__lte'] = self.request.GET['salePriceTo']
        if 'saleDateFrom' in self.request.GET:
            query['saleDate__gte'] = self.request.GET['saleDateFrom']
        if 'saleDateTo' in self.request.GET:
            query['saleDate__lte'] = self.request.GET['saleDateTo']
        if 'leaseableAreaFrom' in self.request.GET:
            query['sizeSquareFootage__gte'] = self.request.GET['leaseableAreaFrom']
        if 'leaseableAreaTo' in self.request.GET:
            query['sizeSquareFootage__lte'] = self.request.GET['leaseableAreaTo']

        if 'capitalizationRateFrom' in self.request.GET:
            query['capitalizationRate__gte'] = self.request.GET['capitalizationRateFrom']
        if 'capitalizationRateTo' in self.request.GET:
            query['capitalizationRate__lte'] = self.request.GET['capitalizationRateTo']

        if 'pricePerSquareFootFrom' in self.request.GET:
            query['pricePerSquareFoot__gte'] = self.request.GET['pricePerSquareFootFrom']
        if 'pricePerSquareFootTo' in self.request.GET:
            query['pricePerSquareFoot__lte'] = self.request.GET['pricePerSquareFootTo']


        if 'clearCeilingHeightFrom' in self.request.GET:
            query['clearCeilingHeight__gte'] = self.request.GET['clearCeilingHeightFrom']
        if 'clearCeilingHeightTo' in self.request.GET:
            query['clearCeilingHeight__lte'] = self.request.GET['clearCeilingHeightTo']

        if 'shippingDoorsFrom' in self.request.GET:
            query['shippingDoors__gte'] = self.request.GET['shippingDoorsFrom']
        if 'shippingDoorsTo' in self.request.GET:
            query['shippingDoors__lte'] = self.request.GET['shippingDoorsTo']

        if 'siteCoverageFrom' in self.request.GET:
            query['siteCoverage__gte'] = self.request.GET['siteCoverageFrom']
        if 'siteCoverageTo' in self.request.GET:
            query['siteCoverage__lte'] = self.request.GET['siteCoverageTo']

        if 'sizeOfLandAcresFrom' in self.request.GET:
            query['sizeOfLandAcres__gte'] = self.request.GET['sizeOfLandAcresFrom']
        if 'sizeOfLandAcresTo' in self.request.GET:
            query['sizeOfLandAcres__lte'] = self.request.GET['sizeOfLandAcresTo']

        if 'sizeOfLandSqftFrom' in self.request.GET:
            query['sizeOfLandSqft__gte'] = self.request.GET['sizeOfLandSqftFrom']
        if 'sizeOfLandSqftTo' in self.request.GET:
            query['sizeOfLandSqft__lte'] = self.request.GET['sizeOfLandSqftTo']

        if 'pricePerSquareFootLandFrom' in self.request.GET:
            query['pricePerSquareFootLand__gte'] = self.request.GET['pricePerSquareFootLandFrom']
        if 'pricePerSquareFootLandTo' in self.request.GET:
            query['pricePerSquareFootLand__lte'] = self.request.GET['pricePerSquareFootLandTo']

        if 'propertyType' in self.request.GET:
            query['propertyType'] = self.request.GET['propertyType']


        if 'pricePerAcreLandFrom' in self.request.GET:
            query['pricePerAcreLand__gte'] = self.request.GET['pricePerAcreLandFrom']
        if 'pricePerAcreLandTo' in self.request.GET:
            query['pricePerAcreLand__lte'] = self.request.GET['pricePerAcreLandTo']


        if 'pricePerSquareFootBuildableAreaFrom' in self.request.GET:
            query['pricePerSquareFootBuildableArea__gte'] = self.request.GET['pricePerSquareFootBuildableAreaFrom']
        if 'pricePerSquareFootBuildableAreaTo' in self.request.GET:
            query['pricePerSquareFootBuildableArea__lte'] = self.request.GET['pricePerSquareFootBuildableAreaTo']



        if 'propertyTags[]' in self.request.GET:
            query['propertyTags__all'] = [value for key, value in self.request.GET.items() if key == 'propertyTags[]']

        if 'locationTop' in self.request.GET:
            query['location__geo_within_box'] = [
                (float(self.request.GET['locationLeft']), float(self.request.GET['locationBottom'])),
                (float(self.request.GET['locationRight']), float(self.request.GET['locationTop']))
            ]

        if 'tenancyType' in self.request.GET:
            query['tenancyType'] = self.request.GET['tenancyType']

        if "view_all" not in self.request.effective_principals:
            query["owner"] = self.request.authenticated_userid

        comparableSales = ComparableSale.objects(**query)

        if 'sort' in self.request.GET:
            comparableSales = comparableSales.order_by(self.request.GET['sort'])

        return {"comparableSales": list([json.loads(sale.to_json()) for sale in comparableSales])}

    def get(self):
        comparableId = self.request.matchdict['id']

        comparableSale = ComparableSale.objects(id=comparableId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, comparableSale)
        if not auth:
            raise HTTPForbidden("You do not have access to this comparable sale.")

        if comparableSale is None:
            return {"comparableSale": None}

        return {"comparableSale": json.loads(comparableSale.to_json())}

    def collection_post(self):
        data = self.request.json_body

        data['owner'] = self.request.authenticated_userid

        comparable = ComparableSale(**data)
        comparable.save()

        return {"_id": str(comparable.id)}


    def post(self):
        data = self.request.json_body

        comparableId = self.request.matchdict['id']

        if '_id' in data:
            del data['_id']

        comparable = ComparableSale.objects(id=comparableId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, comparable)
        if not auth:
            raise HTTPForbidden("You do not have access to this comparable sale.")

        comparable.modify(**data)

        comparable.save()

        return {"_id": str(comparableId)}

    def delete(self):
        fileId = self.request.matchdict['id']

        comparable = ComparableSale.objects(id=fileId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, comparable)
        if not auth:
            raise HTTPForbidden("You do not have access to this comparable sale.")

        comparable.delete()

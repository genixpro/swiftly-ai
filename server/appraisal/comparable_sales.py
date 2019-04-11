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
        query = {}
        if 'salePriceFrom' in self.request.GET:
            query['salePrice__gt'] = self.request.GET['salePriceFrom']
        if 'salePriceTo' in self.request.GET:
            query['salePrice__lt'] = self.request.GET['salePriceTo']
        if 'saleDateFrom' in self.request.GET:
            query['saleDate__gt'] = self.request.GET['saleDateFrom']
        if 'saleDateTo' in self.request.GET:
            query['saleDate__lt'] = self.request.GET['saleDateTo']
        if 'leaseableAreaFrom' in self.request.GET:
            query['sizeSquareFootage__gt'] = self.request.GET['leaseableAreaFrom']
        if 'leaseableAreaTo' in self.request.GET:
            query['sizeSquareFootage__lt'] = self.request.GET['leaseableAreaTo']

        if 'capitalizationRateFrom' in self.request.GET:
            query['capitalizationRate__gt'] = self.request.GET['capitalizationRateFrom']
        if 'capitalizationRateTo' in self.request.GET:
            query['capitalizationRate__lt'] = self.request.GET['capitalizationRateTo']

        if 'pricePerSquareFootFrom' in self.request.GET:
            query['pricePerSquareFoot__gt'] = self.request.GET['pricePerSquareFootFrom']
        if 'pricePerSquareFootTo' in self.request.GET:
            query['pricePerSquareFoot__lt'] = self.request.GET['pricePerSquareFootTo']


        if 'clearCeilingHeightFrom' in self.request.GET:
            query['clearCeilingHeight__gt'] = self.request.GET['clearCeilingHeightFrom']
        if 'clearCeilingHeightTo' in self.request.GET:
            query['clearCeilingHeight__lt'] = self.request.GET['clearCeilingHeightTo']

        if 'shippingDoorsFrom' in self.request.GET:
            query['shippingDoors__gt'] = self.request.GET['shippingDoorsFrom']
        if 'shippingDoorsTo' in self.request.GET:
            query['shippingDoors__lt'] = self.request.GET['shippingDoorsTo']

        if 'siteCoverageFrom' in self.request.GET:
            query['siteCoverage__gt'] = self.request.GET['siteCoverageFrom']
        if 'siteCoverageTo' in self.request.GET:
            query['siteCoverage__lt'] = self.request.GET['siteCoverageTo']

        if 'propertyType' in self.request.GET:
            query['propertyType'] = self.request.GET['propertyType']


        if 'propertyTags' in self.request.GET:
            query['propertyTags__all'] = self.request.GET['propertyTags']

        if 'locationTop' in self.request.GET:
            query['location__geo_within_box'] = [
                (float(self.request.GET['locationLeft']), float(self.request.GET['locationBottom'])),
                (float(self.request.GET['locationRight']), float(self.request.GET['locationTop']))
            ]

        comparableSales = ComparableSale.objects(**query)

        return {"comparableSales": list([json.loads(sale.to_json()) for sale in comparableSales])}

    def get(self):
        comparableId = self.request.matchdict['id']

        comparableSale = ComparableSale.objects(id=comparableId).first()

        if comparableSale is None:
            return {"comparableSale": None}

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

    def delete(self):
        fileId = self.request.matchdict['id']

        sale = ComparableSale.objects(id=fileId).first()
        sale.delete()

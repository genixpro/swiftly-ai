from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
import bson
import json
from .components.document_processor import DocumentProcessor
from pprint import pprint
from .models.appraisal import Appraisal
from .models.file import File
from pyramid.security import Authenticated
from pyramid.authorization import Allow, Deny, Everyone
from .authorization import checkUserOwnsObject
from pyramid.httpexceptions import HTTPForbidden

@resource(collection_path='/appraisal/', path='/appraisal/{id}', renderer='bson', cors_enabled=True, cors_origins="*", permission="everything")
class AppraisalAPI(object):

    def __init__(self, request, context=None):
        self.request = request

        self.processor = DocumentProcessor(request.registry.db, request.registry.azureBlobStorage)

    def __acl__(self):
        return [
            (Allow, Authenticated, 'everything'),
            (Deny, Everyone, 'everything')
        ]

    def collection_get(self):
        query = {}

        if "admin" not in self.request.effective_principals:
            query["owner"] = self.request.authenticated_userid

        appraisals = Appraisal.objects(**query).only('name', 'address')

        return {"appraisals": [json.loads(appraisal.to_json()) for appraisal in appraisals]}

    def collection_post(self):
        data = self.request.json_body

        data['owner'] = self.request.authenticated_userid

        appraisal = Appraisal(**data)
        appraisal.save()

        return {"_id": str(appraisal.id)}


    def get(self):
        appraisalId = self.request.matchdict['id']

        appraisal = Appraisal.objects(id=appraisalId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, appraisal)
        if not auth:
            raise HTTPForbidden("You do not have access to this appraisal.")

        # files = File.objects(appraisalId=appraisalId)
        #
        # # documents = [Document(file) for file in files]
        # documents = [file for file in files]
        #
        # print(documents)

        # marketData = MarketData.getTestingMarketData()

        # discountedCashFlow = DiscountedCashFlowModel(documents, marketData, 8.0)
        # /appraisal['cashFlows'] = discountedCashFlow.cashFlows
        # appraisal['cashFlowSummary'] = discountedCashFlow.cashFlowSummary
        # appraisal['rentRoll'] = discountedCashFlow.rentRoll

        # pprint(appraisal['rentRoll'])

        return {"appraisal": json.loads(appraisal.to_json())}


    def delete(self):
        appraisalId = self.request.matchdict['id']

        appraisal = Appraisal.objects(id=appraisalId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, appraisal)
        if not auth:
            raise HTTPForbidden("You do not have access to this appraisal.")

        appraisal.delete()

        return {}


    def post(self):
        data = self.request.json_body

        appraisalId = self.request.matchdict['id']

        if '_id' in data:
            del data['_id']

        appraisal = Appraisal.objects(id=appraisalId).first()

        auth = checkUserOwnsObject(self.request.authenticated_userid, self.request.effective_principals, appraisal)
        if not auth:
            raise HTTPForbidden("You do not have access to this appraisal.")

        appraisal.modify(**data)

        self.processor.processAppraisalResults(appraisal)

        appraisal.save()

        return {}




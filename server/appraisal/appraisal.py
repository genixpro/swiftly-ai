from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
import bson
from webob_graphql import serve_graphql_request
from .components.discounted_cash_flow import DiscountedCashFlowModel
from .components.market_data import MarketData
from pprint import pprint
from .models.appraisal import Appraisal
from .models.file import File


@resource(collection_path='/appraisal/', path='/appraisal/{id}', renderer='bson', cors_enabled=True, cors_origins="*")
class AppraisalAPI(object):

    def __init__(self, request, context=None):
        self.request = request

    def __acl__(self):
        return [(Allow, Everyone, 'everything')]

    def collection_get(self):
        appraisals = Appraisal.objects()

        return {"appraisals": [appraisal.to_mongo() for appraisal in appraisals]}

    def collection_post(self):
        data = self.request.json_body

        appraisal = Appraisal(**data)
        appraisal.save()

        return {"_id": str(appraisal.id)}


    def get(self):
        appraisalId = self.request.matchdict['id']

        appraisal = Appraisal.objects(id=appraisalId).first()

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

        return {"appraisal": appraisal.to_mongo()}


    def post(self):
        data = self.request.json_body

        appraisalId = self.request.matchdict['id']

        if '_id' in data:
            del data['_id']

        appraisal = Appraisal.objects(id=appraisalId)
        appraisal.update(**data)
        appraisal.save()

        return {"_id": str(id)}




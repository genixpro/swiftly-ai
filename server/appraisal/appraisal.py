from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
import bson
from webob_graphql import serve_graphql_request


@resource(collection_path='/appraisal/', path='/appraisal/{id}', renderer='bson', cors_enabled=True, cors_origins="*")
class AppraisalAPI(object):

    def __init__(self, request, context=None):
        self.request = request
        self.appraisalsCollection = request.registry.db['appraisals']

    def __acl__(self):
        return [(Allow, Everyone, 'everything')]

    def collection_get(self):
        appraisals = self.appraisalsCollection.find({})

        return {"appraisals": list(appraisals)}

    def collection_post(self):
        data = self.request.json_body
        result = self.appraisalsCollection.insert_one(data)

        id = result.inserted_id
        return {"_id": str(id)}


    def get(self):
        appraisalId = self.request.matchdict['id']

        appraisal = self.appraisalsCollection.find_one({"_id": bson.ObjectId(appraisalId)})

        return {"appraisal": appraisal}

from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
from .schema import Appraisal
from webob_graphql import serve_graphql_request


@resource(collection_path='/appraisal/', path='/appraisal/{id}', renderer='bson', cors_enabled=True, cors_origins="*")
class AppraisalAPI(object):

    def __init__(self, request, context=None):
        self.request = request
        self.appraisalsCollection = request.registry.db['appraisals']

    def __acl__(self):
        return [(Allow, Everyone, 'everything')]

    def collection_post(self):
        context = {'session': self.request.session}

        # Optional, for adding batch query support (used in Apollo-Client)
        return serve_graphql_request(self.request, Appraisal, batch_enabled=True, context_value=context)

        # return self.appraisalsCollection.find({})

    def get(self):
        return _USERS.get(int(self.request.matchdict['id']))

    def collection_post(self):
        data = self.request.json_body
        result = self.appraisalsCollection.insert_one(data)

        id = result.inserted_id
        return {"_id": str(id)}

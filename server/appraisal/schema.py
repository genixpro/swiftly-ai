import graphene
from graphene.relay import Node
from graphene_mongo import MongoengineConnectionField, MongoengineObjectType
from .models import Appraisal as AppraisalModel


class Appraisal(MongoengineObjectType):
    class Meta:
        model = AppraisalModel
        interfaces = (Node,)


class Query(graphene.ObjectType):
    appraisal = Node.Field()
    appraisals = graphene.List(Appraisal)


    def resolve_appraisals(self, info):
    	return list(AppraisalModel.objects.all())

schema = graphene.Schema(query=Query, types=[Appraisal])

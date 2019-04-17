from cornice.resource import resource
from pyramid.authorization import Allow, Everyone
from pyramid.response import Response
import collada, collada.source
import io
import pkg_resources
from .models.appraisal import Appraisal
from pyramid.security import Authenticated
from pyramid.authorization import Allow, Deny, Everyone


@resource(path='/appraisal/{appraisalId}/building', renderer='bson', cors_enabled=True, cors_origins="*", permission="everything")
class BuildingModelAPI(object):

    def __init__(self, request, context=None):
        self.request = request

    def __acl__(self):
        return [(Allow, Everyone, 'everything')]

    def get(self):
        appraisalId = self.request.matchdict['appraisalId']

        appraisal = Appraisal.objects(id=appraisalId).first()

        floors = 5

        buildingFile = pkg_resources.resource_stream("appraisal", "3dmodel/building.dae")
        scene = collada.Collada(buildingFile)

        geometry = scene.geometries[0]

        for floor in range(floors):
            indices = list(range(8))
            # inputlist = collada.source.InputList()
            # inputlist.addInput()


            translate = collada.scene.TranslateTransform(floor, floor, floor)

            baseNode = collada.scene.Node(f"floor{floor}", transforms=[translate])
            baseNode.children.append(collada.scene.GeometryNode(geometry))
            # node =

            baseNode.save()
            scene.nodes.append(baseNode)

            print(baseNode)

            # geometry.createTriangleSet(indices, inputlist, materialid)


        scene.save()

        buffer = io.BytesIO()
        scene.write(buffer)

        buffer.seek(0)

        response = Response()
        response.body_file = buffer
        response.content_type = "model/vnd.collada+xml"

        scene.write("bang.dae")

        return response

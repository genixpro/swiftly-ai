from mongoengine import *
import datetime
from .custom_id_field import CustomIDField
from ..migrations import registerMigration
import json as json, bson
from .custom_id_field import generateNewUUID


class PropertyTag(Document):
    meta = {
        'strict': False,
        'indexes': [
            ('owner', '$name', 'propertyType'),
            'version'
        ]
    }

    id = CustomIDField()

    # The owner of this property tag
    owner = StringField()

    # The name of the propertyTag
    name = StringField()

    # The property type associated with this tag
    propertyType = StringField()

    # A stats object which contains property
    propertyTypeStats = DictField(IntField())

    version = IntField(default=1)


@registerMigration(PropertyTag, 2)
def migration_001_002_update_tag_object_id(object):
    data = json.loads(object.to_json())
    if len(str(object.id)) == 24:
        del data['_id']
        data['id'] = str(object.id)

        PropertyTag.objects(id=bson.ObjectId(object.id)).delete()

        newObject = PropertyTag(**data)
        return newObject

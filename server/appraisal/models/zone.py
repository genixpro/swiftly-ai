from mongoengine import *
import datetime
from .custom_id_field import CustomIDField
from ..migrations import registerMigration
import json, bson
from .custom_id_field import generateNewUUID


class Zone(Document):
    meta = {'strict': False}

    id = CustomIDField()

    # The owner of this zone
    owner = StringField()

    # The name of the zone
    zoneName = StringField()

    # Writeup describing the zone
    description = StringField()

    version = IntField(default=1)

@registerMigration(Zone, 1)
def migration_001_update_zone_object_id(object):
    data = json.loads(object.to_json())
    if len(str(object.id)) == 24:
        del data['_id']
        data['id'] = str(object.id)

        Zone.objects(id=bson.ObjectId(object.id)).delete()

        newObject = Zone(**data)
        return newObject

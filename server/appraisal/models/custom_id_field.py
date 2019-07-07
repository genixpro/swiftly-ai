import mongoengine.fields
import datetime
import dateparser
import bson
import uuid
import base64

class CustomIDField(mongoengine.fields.StringField):
    def __init__(self, **kwargs):
        kwargs['primary_key'] = True
        super(CustomIDField, self).__init__(**kwargs)

    def validate(self, value):
        if type(value) == str:
            if len(value) == 24:
                try:
                    bson.ObjectId(value)
                    return True
                except Exception:
                    return False
            else:
                return True
        return False

    def to_mongo(self, value):
        return regularizeID(value)

    def to_python(self, value):
        return str(value)


def generateNewUUID(modelClass):
    currentLength = 8
    id = base64.urlsafe_b64encode(uuid.uuid4().bytes).rstrip(b'=').decode('ascii')[:currentLength]
    while modelClass.objects(id=id):
        currentLength += 4
        if currentLength == 24:
            currentLength += 4
        id = base64.urlsafe_b64encode(uuid.uuid4().bytes).rstrip(b'=').decode('ascii')[:currentLength]
    return id

def regularizeID(value):
    if isinstance(value, dict):
        if '$oid' in value:
            return bson.ObjectId(value['$oid'])

    if isinstance(value, str):
        if len(value) == 24:
            return bson.ObjectId(value)
        else:
            return value
    return value

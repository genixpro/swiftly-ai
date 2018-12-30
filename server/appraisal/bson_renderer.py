import bson.json_util


class BSONRenderer(object):
    def __init__(self, info):
        pass

    def __call__(self, value, system):
        """ Renders values using Mongos BSON utility (rather then vanilla Python JSON module). """

        return bson.json_util.dumps(value)




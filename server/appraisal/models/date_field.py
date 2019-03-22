import mongoengine.fields
import datetime


class ConvertingDateField(mongoengine.fields.DateTimeField):
    def to_mongo(self, value):
        if isinstance(value, dict):
            if '$date' in value:
                value = datetime.datetime.fromtimestamp(value['$date'] / 1000.0)

        value = super(ConvertingDateField, self).to_mongo(value)
        # drop hours, minutes, seconds
        if isinstance(value, datetime.datetime):
            value = datetime.datetime(value.year, value.month, value.day)
        return value

    def to_python(self, value):
        value = super(ConvertingDateField, self).to_python(value)
        # convert datetime to date
        if isinstance(value, datetime.datetime):
            value = datetime.datetime(value.year, value.month, value.day)
        return value


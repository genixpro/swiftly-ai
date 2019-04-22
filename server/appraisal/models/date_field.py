import mongoengine.fields
import datetime
import dateparser


class ConvertingDateField(mongoengine.fields.DateTimeField):
    def __init__(self, **kwargs):
        super(ConvertingDateField, self).__init__(**kwargs)

    def validate(self, value):
        if value is None:
            return True
        return super(ConvertingDateField, self).validate(value)

    def to_mongo(self, value):
        if isinstance(value, dict):
            if '$date' in value:
                value = datetime.datetime.fromtimestamp(value['$date'] / 1000.0)

        if value == "" or value is None:
            return None

        if isinstance(value, str):
            value = dateparser.parse(value)

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

        if isinstance(value, str):
            value = dateparser.parse(value)

        return value


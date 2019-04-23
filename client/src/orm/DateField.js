import BaseField from "./BaseField";
import _ from "underscore";

class DateField extends BaseField
{
    constructor(fieldName, defaultValue)
    {
        super(fieldName);

        if (_.isUndefined(defaultValue))
        {
            this.defaultValue = null;
        }
        else
        {
            this.defaultValue = defaultValue;
        }
    }

    toObject(value, parent)
    {
        if (_.isUndefined(value) || _.isNull(value))
        {
            if(_.isFunction(this.defaultValue))
            {
                return this.defaultValue();
            }
            else
            {
                return this.defaultValue;
            }
        }
        else if (_.isObject(value) && value['$date'])
        {
            return new Date(value['$date']);
        }
        else
        {
            return value;
        }
    }
}

export default DateField;


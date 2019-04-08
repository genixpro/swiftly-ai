import BaseField from "./BaseField";
import _ from "underscore";

class DateField extends BaseField
{
    toObject(value, parent)
    {
        if (_.isObject(value) && value['$date'])
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


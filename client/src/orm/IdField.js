import BaseField from "./BaseField";
import _ from 'underscore';

class IdField extends BaseField
{
    toObject(value, parent)
    {
        if (value)
        {
            if (_.isString(value))
            {
                return value;
            }
            else if (_.isObject(value))
            {
                return value['$oid'];
            }
        }
    }
}

export default IdField;


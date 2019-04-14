import BaseField from "./BaseField";
import _ from "underscore";

class StringField extends BaseField
{
    toObject(value, parent)
    {
        if (_.isUndefined(value) || _.isNull(value))
        {
            return null;
        }
        else
        {
            return value.toString();
        }
    }
}

export default StringField;


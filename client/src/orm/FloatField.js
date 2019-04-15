import BaseField from "./BaseField";
import _ from "underscore";

class FloatField extends BaseField
{
    toObject(value, parent)
    {
        if (_.isUndefined(value) || _.isNull(value))
        {
            return null;
        }
        else
        {
            try
            {
                return Number(value);
            }
            catch(err)
            {
                console.error("Received an invalid numerical value.");
                return value;
            }
        }
    }
}

export default FloatField;


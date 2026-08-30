import BaseField from "./BaseField";
import _ from "underscore";

class FloatField extends BaseField
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

    applyDiff(oldValue, diffValue, parent)
    {
        return diffValue;
    }
}

export default FloatField;


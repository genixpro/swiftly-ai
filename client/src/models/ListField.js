import BaseField from "./BaseField";
import _ from "underscore";

class ListField extends BaseField
{
    constructor(subField)
    {
        super();

        this.subField = subField;
    }

    set keyName(value)
    {
        this.subField.keyName = value
    }

    get keyName()
    {
        return this.subField.keyName;
    }

    toObject(value, parent)
    {
        if (!_.isArray(value))
        {
            return null;
        }
        else if (_.isUndefined(value))
        {
            return null;
        }
        else
        {
            return value.map((subValue) => this.subField.toObject(subValue, parent));
        }
    }
}

export default ListField;



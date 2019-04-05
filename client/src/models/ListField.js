import BaseField from "./BaseField";
import _ from "underscore";

class ListField extends BaseField
{
    constructor(subField)
    {
        super();

        this.subField = subField;
    }

    toObject(value, parent)
    {
        if (!_.isArray(value))
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



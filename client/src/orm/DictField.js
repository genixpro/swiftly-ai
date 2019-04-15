import BaseField from "./BaseField";
import _ from "underscore";

class DictField extends BaseField
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
        if (!_.isObject(value))
        {
            return null;
        }
        else if (_.isUndefined(value))
        {
            return null;
        }
        else
        {
            const newObject = {};
            Object.keys(value).forEach((key) => newObject[key] = this.subField.toObject(value[key], parent));

            // We create a JS proxy over the array, so that we can catch its mutations.
            return new Proxy(newObject, {
                set: (target, prop, value) => {
                    parent.setDirtyField(this.fieldName || this.keyName);
                    target[prop] = value;
                    return true;
                }
            });
        }
    }
}

export default DictField;



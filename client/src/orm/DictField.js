import BaseField from "./BaseField";
import _ from "underscore";

class DictField extends BaseField
{
    constructor(subField, defaultValue)
    {
        super();

        this.subField = subField;

        if (_.isUndefined(defaultValue))
        {
            this.defaultValue = {};
        }
        else
        {
            this.defaultValue = defaultValue;
        }
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
            return this.defaultValue;
        }
        else if (_.isUndefined(value))
        {
            return this.defaultValue;
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

    applyDiff(oldValue, diffValue, parent)
    {
        Object.keys(diffValue).forEach((key) =>
        {
            if (key === '$delete')
            {
                diffValue[key].forEach((subKey) =>
                {
                    if (!_.isUndefined(oldValue[subKey]))
                    {
                        delete oldValue[subKey];
                    }
                });
            }
            else if (key === '$replace')
            {
                Object.keys(diffValue[key]).forEach((modKey) =>
                {
                    oldValue[modKey] = this.subField.toObject(diffValue[key][modKey], oldValue);
                })
            }
            else
            {
                oldValue[key] = this.subField.applyDiff(oldValue[key], diffValue[key], parent);
            }
        });
        return oldValue;
    }
}

export default DictField;



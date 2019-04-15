import BaseField from "./BaseField";
import _ from "underscore";

class ListField extends BaseField
{
    static ListMutatorFunctions = [
        "copyWithin",
        "fill",
        "pop",
        "push",
        "reverse",
        "shift",
        "sort",
        "splice",
        "unshift"
    ];

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
            const list = value.map((subValue) => this.subField.toObject(subValue, parent));

            // We create a JS proxy over the array, so that we can catch its mutations.
            const proxy = new Proxy(list, {
                set: (target, prop, value) => {
                    parent.setDirtyField(this.fieldName || this.keyName);
                    target[prop] = value;
                    return true;
                    // return Reflect.set(...arguments);
                },
                get: (target, prop, receiver) => {
                    const val = target[prop];

                    // Catch all the mutator methods.
                    if (ListField.ListMutatorFunctions.indexOf(prop) !== -1)
                    {
                        parent.setDirtyField(this.fieldName || this.keyName);
                    }

                    return val;
                }
            });

            return proxy;
        }
    }
}

export default ListField;



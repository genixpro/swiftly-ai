import BaseField from "./BaseField";


/**
 * This class is encapsulates data that is sent down from the server.
 *
 *
 */
class BaseModel extends Object
{
    static parentSymbol = Symbol("parent");

    constructor(data, parent)
    {
        super();

        const modelClass = this.constructor;

        Object.keys(modelClass).forEach((key) =>
        {
            if (modelClass[key] instanceof BaseField)
            {
                const field = modelClass[key];

                if (field.fieldName)
                {
                    this[field.fieldName] = modelClass[key].toObject(data[field.fieldName], this);
                }
                else
                {
                    this[key] = modelClass[key].toObject(data[key], this);
                }
            }
        });

        if (parent)
        {
            this[BaseModel.parentSymbol] = parent;
        }
        else
        {
            this[BaseModel.parentSymbol] = null;
        }
    }

    // We use a getter like this with a javascript Symbol, so that the parent reference doesn't get serialized if this object is converted back into JSON
    get parent()
    {
        return this[BaseModel.parentSymbol];
    }
}

export default BaseModel;


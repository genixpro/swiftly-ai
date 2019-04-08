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

        if (!data)
        {
            return;
        }



        try
        {
            const modelClass = this.constructor;

            // First validate
            Object.keys(data).forEach((key) =>
            {
                if (!modelClass[key])
                {
                    const message = `Unexpected key ${key} on model ${modelClass.name} on the data received from the server.`;
                    if (process.env.VALUATE_ENVIRONMENT.REACT_APP_DEBUG)
                    {
                        alert(message)
                    }
                    console.error(message);
                }
            });

            // Then copy in data
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
        catch(err)
        {
            console.log("Error loading BaseModel subclass fields.");
            console.log(err);
        }
    }

    // We use a getter like this with a javascript Symbol, so that the parent reference doesn't get serialized if this object is converted back into JSON
    get parent()
    {
        return this[BaseModel.parentSymbol];
    }
}

export default BaseModel;


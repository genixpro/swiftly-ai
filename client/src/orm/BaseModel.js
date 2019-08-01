import BaseField from "./BaseField";
import _ from "underscore";
import IntField from "./IntField";

/**
 * This class is encapsulates data that is sent down from the server.
 *
 *
 */
class BaseModel extends Object
{
    static parentSymbol = Symbol("parent");
    static fieldNameSymbol = Symbol("fieldName");
    static dirtyFieldsSymbol = Symbol("dirtyFields");
    
    static version = new IntField();

    static create(data, parent, fieldName)
    {
        const object = new this(data, parent, fieldName, "createFunc");

        return new Proxy(object, {
            set: (target, name, value, receiver) => {
                Reflect.set(target, name, value);

                receiver.setDirtyField(name);

                return true;
            }
        })
    }

    constructor(data, parent, fieldName, createFuncCheck)
    {
        super();

        if (createFuncCheck !== "createFunc")
        {
            throw new Error(`You can not call the constructor of ${this.constructor.name} directly. You must instead call ${this.constructor.name}.create()`);
        }

        this[BaseModel.dirtyFieldsSymbol] = {};
        this[BaseModel.fieldNameSymbol] = fieldName;

        if (parent)
        {
            this[BaseModel.parentSymbol] = parent;
        }
        else
        {
            this[BaseModel.parentSymbol] = null;
        }

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

                    field.keyName = key;

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
        }
        catch(err)
        {
            console.log("Error loading BaseModel subclass fields.");
            console.log(err);
            if (process.env.VALUATE_ENVIRONMENT.REACT_APP_DEBUG)
            {
                alert(err);
            }
        }

        this.initialize();
    }

    get fieldNames()
    {
        const modelClass = this.constructor;

        const names = [];

        // Then copy in data
        Object.keys(modelClass).forEach((key) =>
        {
            if (modelClass[key] instanceof BaseField)
            {
                const field = modelClass[key];

                if (field.fieldName)
                {
                    names.push(field.fieldName)
                }
                else
                {
                    names.push(key);
                }
            }
        });

        return names;
    }

    setDirtyField(field)
    {
        if (this.fieldNames.indexOf(field) !== -1)
        {
            this[BaseModel.dirtyFieldsSymbol][field] = true;

            if (this[BaseModel.parentSymbol])
            {
                this[BaseModel.parentSymbol].setDirtyField(this[BaseModel.fieldNameSymbol]);
            }
        }
    }

    getUpdates()
    {
        const updates = {};

        Object.keys(this[BaseModel.dirtyFieldsSymbol]).forEach((key) =>
        {
            // First validate
            if (this.fieldNames.indexOf(key) !== -1)
            {
                updates[key] = this[key];
            }
        });

        return updates;
    }

    clearUpdates()
    {
        this[BaseModel.dirtyFieldsSymbol] = {};
    }


    applyDiff(diff)
    {
        const modelClass = this.constructor;

        // Then copy in data
        Object.keys(modelClass).forEach((key) =>
        {
            if (modelClass[key] instanceof BaseField)
            {
                const field = modelClass[key];

                field.keyName = key;

                if (field.fieldName)
                {
                    let diffValue = diff[field.fieldName];
                    if (_.isUndefined(diffValue) && diff["$replace"] && !_.isUndefined(diff["$replace"][field.fieldName]))
                    {
                        diffValue = diff["$replace"][field.fieldName];
                    }

                    if (!_.isUndefined(diffValue))
                    {
                        this[field.fieldName] = modelClass[key].applyDiff(this[field.fieldName], diffValue, this);
                    }

                    if (diff['$delete'] && diff['$delete'].indexOf(field.fieldName) !== -1)
                    {
                        this[field.fieldName] = null;
                    }
                }
                else
                {
                    let diffValue = diff[key];

                    if (_.isUndefined(diffValue) && diff["$replace"] && !_.isUndefined(diff["$replace"][key]))
                    {
                        diffValue = diff["$replace"][key];
                    }

                    if (!_.isUndefined(diffValue))
                    {
                        this[key] = modelClass[key].applyDiff(this[key], diffValue, this);
                    }

                    if (diff['$delete'] && diff['$delete'].indexOf(key) !== -1)
                    {
                        this[key] = null;
                    }
                }
            }
        });
    }

    initialize()
    {

    }

    // We use a getter like this with a javascript Symbol, so that the parent reference doesn't get serialized if this object is converted back into JSON
    get parent()
    {
        return this[BaseModel.parentSymbol];
    }
}

export default BaseModel;


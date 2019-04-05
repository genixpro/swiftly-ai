import BaseField from "./BaseField";


class ModelField extends BaseField
{
    constructor(model, fieldName)
    {
        super(fieldName);

        this.model = model;
    }

    toObject(value, parent)
    {
        return new this.model(value, parent);
    }
}

export default ModelField;



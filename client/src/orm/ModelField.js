import BaseField from "./BaseField";


class ModelField extends BaseField
{
    constructor(model, fieldName)
    {
        super(fieldName);

        this.model = model;

        this.fieldName = fieldName;
    }

    toObject(value, parent)
    {
        return this.model.create(value, parent, this.fieldName || this.keyName);
    }

    applyDiff(oldValue, diffValue, parent)
    {
        oldValue.applyDiff(diffValue);
        return oldValue;
    }
}

export default ModelField;



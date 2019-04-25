

class BaseField
{
    constructor(fieldName, defaultValue)
    {
        this.fieldName = fieldName;
    }

    applyDiff(oldValue, newValue, parent)
    {
        return newValue;
    }
}


export default BaseField;

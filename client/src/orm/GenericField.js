import BaseField from "./BaseField";


class GenericField extends BaseField
{
    toObject(value, parent)
    {
        return value;
    }
}

export default GenericField;


import BaseField from "./BaseField";


class IdField extends BaseField
{
    toObject(value, parent)
    {
        if (value)
        {
            return value['$oid'];
        }
    }
}

export default IdField;


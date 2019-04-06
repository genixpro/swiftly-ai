import BaseField from "./BaseField";


class IdField extends BaseField
{
    toObject(value, parent)
    {
        return value['$oid'];
    }
}

export default IdField;


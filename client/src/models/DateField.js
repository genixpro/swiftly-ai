import BaseField from "./BaseField";


class DateField extends BaseField
{
    toObject(value, parent)
    {
        return new Date(value['$date']);
    }
}

export default DateField;


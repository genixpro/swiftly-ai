import BaseField from "./BaseField";


class DateField extends BaseField
{
    toObject(value, parent)
    {
        if (value['$date'])
        {
            return new Date(value['$date']);
        }
        else
        {
            return value;
        }
    }
}

export default DateField;


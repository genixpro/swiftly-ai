import GenericField from "../orm/GenericField";
import ModelField from "../orm/ModelField";
import ListField from "../orm/ListField";
import DateField from "../orm/DateField";
import BaseModel from "../orm/BaseModel";
import StringField from "../orm/StringField";
import FloatField from "../orm/FloatField";


class AmortizationItem extends BaseModel
{
    static itemName = new StringField('name');

    static amount = new FloatField();

    static interest = new FloatField();

    static discountRate = new FloatField();

    static startDate = new DateField();

    static periodMonths = new FloatField();
}


class AmortizationSchedule extends BaseModel
{
    static items = new ListField(new ModelField(AmortizationItem));
}

export default AmortizationSchedule;


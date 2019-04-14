import GenericField from "./GenericField";
import ModelField from "./ModelField";
import ListField from "./ListField";
import DateField from "./DateField";
import BaseModel from "./BaseModel";


class AmortizationItem extends BaseModel
{
    static itemName = new GenericField('name');

    static amount = new GenericField();

    static interest = new GenericField();

    static discountRate = new GenericField();

    static startDate = new DateField();

    static periodMonths = new GenericField();
}


class AmortizationSchedule extends BaseModel
{
    static items = new ListField(new ModelField(AmortizationItem));
}

export default AmortizationSchedule;


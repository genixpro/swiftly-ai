import GenericField from "./GenericField";
import ModelField from "./ModelField";
import ListField from "./ListField";
import BaseModel from "./BaseModel";


class StabilizedStatementInputsModel extends BaseModel
{
    static capitalizationRate = new GenericField();
    static vacancyRate = new GenericField();

    static modifiers = new GenericField();

    static marketRentDifferentialDiscountRate = new GenericField();
}

export default StabilizedStatementInputsModel;


import GenericField from "./GenericField";
import BaseModel from "./BaseModel";
import ListField from "./ListField";
import ModelField from "./ModelField";

class StabilizedStatementModifier extends BaseModel
{
    static modifierName = new GenericField("name");
    static amount = new GenericField();
}

class StabilizedStatementInputsModel extends BaseModel
{
    static capitalizationRate = new GenericField();
    static vacancyRate = new GenericField();

    static structuralAllowancePercent = new GenericField();

    static modifiers = new ListField(new ModelField(StabilizedStatementModifier));

    static marketRentDifferentialDiscountRate = new GenericField();

    static expensesMode = new GenericField();

    static tmiRatePSF = new GenericField();
}

export default StabilizedStatementInputsModel;


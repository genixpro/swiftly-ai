import GenericField from "../orm/GenericField";
import BaseModel from "../orm/BaseModel";
import ListField from "../orm/ListField";
import ModelField from "../orm/ModelField";
import StringField from "../orm/StringField";
import FloatField from "../orm/FloatField";

class StabilizedStatementModifier extends BaseModel
{
    static modifierName = new StringField("name");
    static amount = new FloatField();
}

class StabilizedStatementInputsModel extends BaseModel
{
    static capitalizationRate = new FloatField();
    static vacancyRate = new FloatField();

    static structuralAllowancePercent = new FloatField();

    static modifiers = new ListField(new ModelField(StabilizedStatementModifier));

    static marketRentDifferentialDiscountRate = new FloatField();

    static expensesMode = new StringField();

    static tmiRatePSF = new FloatField();
}

export default StabilizedStatementInputsModel;


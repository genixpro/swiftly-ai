import BaseModel from "../orm/BaseModel";
import FloatField from "../orm/FloatField";
import StringField from "../orm/StringField";

class CalculationRuleModel extends BaseModel
{
    static percentage = new FloatField();
    static field = new StringField();
}

export default CalculationRuleModel;
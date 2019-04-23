import BaseModel from "../orm/BaseModel";
import StringField from "../orm/StringField";
import FloatField from "../orm/FloatField";
import ModelField from "../orm/ModelField";
import ListField from "../orm/ListField";
import BoolField from "../orm/BoolField";
import CalculationRuleModel from "./CalculationRuleModel";

class RecoveryStructureModel extends BaseModel
{
    static structureName = new StringField("name");

    static baseOnUnitSize = new BoolField();

    static managementCalculationRule = new ModelField(CalculationRuleModel);

    static expenseCalculationRules = new ListField(new ModelField(CalculationRuleModel));
}

export default RecoveryStructureModel;


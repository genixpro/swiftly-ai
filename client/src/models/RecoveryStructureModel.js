import BaseModel from "../orm/BaseModel";
import StringField from "../orm/StringField";
import FloatField from "../orm/FloatField";
import ModelField from "../orm/ModelField";
import ListField from "../orm/ListField";
import BoolField from "../orm/BoolField";
import CalculationRuleModel from "./CalculationRuleModel";
import DictField from "../orm/DictField";

class RecoveryStructureModel extends BaseModel
{
    static structureName = new StringField("name");

    static managementCalculationRule = new ModelField(CalculationRuleModel);

    static expenseRecoveries = new DictField(new FloatField());
}

export default RecoveryStructureModel;


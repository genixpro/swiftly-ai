import BaseModel from "../orm/BaseModel";
import StringField from "../orm/StringField";
import FloatField from "../orm/FloatField";
import ModelField from "../orm/ModelField";
import ListField from "../orm/ListField";
import BoolField from "../orm/BoolField";


class RecoveryRuleModel extends BaseModel
{
    static percentage = new FloatField();
    static field = new StringField();
}

class RecoveryStructureModel extends BaseModel
{
    static structureName = new StringField("name");

    static baseOnUnitSize = new BoolField();

    static managementRecoveryRule = new ModelField(RecoveryRuleModel);

    static expenseRecoveryRules = new ListField(new ModelField(RecoveryRuleModel));
}

export default RecoveryStructureModel;


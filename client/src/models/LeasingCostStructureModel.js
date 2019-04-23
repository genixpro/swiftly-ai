
import BaseModel from "../orm/BaseModel";
import StringField from "../orm/StringField";
import FloatField from "../orm/FloatField";
import ModelField from "../orm/ModelField";
import ListField from "../orm/ListField";
import BoolField from "../orm/BoolField";



class LeasingCostStructureModel extends BaseModel
{
    static leasingCostStructureName = new StringField("name");

    static leasingCommissionPSF = new FloatField();
    static tenantInducementsPSF = new FloatField();
    static renewalPeriod = new FloatField();
    static leasingPeriod = new FloatField();
}

export default LeasingCostStructureModel;



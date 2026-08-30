
import BaseModel from "../orm/BaseModel";
import StringField from "../orm/StringField";
import FloatField from "../orm/FloatField";



class LeasingCostStructureModel extends BaseModel
{
    static leasingCostStructureName = new StringField("name");

    static leasingCommissionPSF = new FloatField("leasingCommissionPSF", 1);
    static leasingCommissionPercentYearOne = new FloatField("leasingCommissionPercentYearOne", 2);
    static leasingCommissionPercentRemainingYears = new FloatField("leasingCommissionPercentRemainingYears", 2);
    static leasingCommissionMode = new StringField("leasingCommissionMode", "psf");


    static tenantInducementsPSF = new FloatField("tenantInducementsPSF", 1);
    static renewalPeriod = new FloatField("renewalPeriod", 3);
    static leasingPeriod = new FloatField("leasingPeriod", 60);

    get isDefault()
    {
        return this.name === LeasingCostStructureModel.defaultLeasingCostName || this.name === "Default";
    }

    static get defaultLeasingCostName()
    {
        return "Standard";
    }
}

export default LeasingCostStructureModel;



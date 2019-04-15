import GenericField from "../orm/GenericField";
import BaseModel from "../orm/BaseModel";
import FloatField from "../orm/FloatField";


class DiscountedCashFlowInputsModel extends BaseModel
{
    static inflation = new FloatField();
    static discountRate = new FloatField();
    static  leasingCommission = new FloatField();
    static tenantInducementsPSF = new FloatField();
    static renewalPeriod = new FloatField();
    static leasingPeriod = new FloatField();
}

export default DiscountedCashFlowInputsModel;


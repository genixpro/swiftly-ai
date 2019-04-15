import GenericField from "./GenericField";
import BaseModel from "./BaseModel";


class DiscountedCashFlowInputsModel extends BaseModel
{
    static inflation = new GenericField();
    static discountRate = new GenericField();
    static  leasingCommission = new GenericField();
    static tenantInducementsPSF = new GenericField();
    static renewalPeriod = new GenericField();
    static leasingPeriod = new GenericField();
}

export default DiscountedCashFlowInputsModel;


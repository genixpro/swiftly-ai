import GenericField from "../orm/GenericField";
import BaseModel from "../orm/BaseModel";
import FloatField from "../orm/FloatField";


class DiscountedCashFlowInputsModel extends BaseModel
{
    static inflation = new FloatField();
    static discountRate = new FloatField();
}

export default DiscountedCashFlowInputsModel;


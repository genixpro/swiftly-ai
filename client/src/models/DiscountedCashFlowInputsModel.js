import BaseModel from "../orm/BaseModel";
import FloatField from "../orm/FloatField";


class DiscountedCashFlowInputsModel extends BaseModel
{
    static startYear = new FloatField();
    static projectionYears = new FloatField();
    static inflation = new FloatField();
    static discountRate = new FloatField();
}

export default DiscountedCashFlowInputsModel;

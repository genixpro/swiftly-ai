import GenericField from "../orm/GenericField";
import BaseModel from "../orm/BaseModel";
import FloatField from "../orm/FloatField";


class DirectComparisonValuation extends BaseModel
{
    static comparativeValue = new FloatField();
    static valuation = new FloatField();
    static valuationRounded = new FloatField();
}

export default DirectComparisonValuation;


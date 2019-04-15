import GenericField from "../orm/GenericField";
import BaseModel from "../orm/BaseModel";
import FloatField from "../orm/FloatField";


class DirectComparisonValuation extends BaseModel
{
    static comparativeValue = new FloatField();

    static marketRentDifferential = new FloatField();

    static freeRentDifferential = new FloatField();

    static vacantUnitDifferential = new FloatField();

    static amortizationDifferential = new FloatField();
    
    static valuation = new FloatField();
    static valuationRounded = new FloatField();
}

export default DirectComparisonValuation;


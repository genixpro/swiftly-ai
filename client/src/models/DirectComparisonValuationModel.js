import BaseModel from "../orm/BaseModel";
import FloatField from "../orm/FloatField";
import BoolField from "../orm/BoolField";


class DirectComparisonValuation extends BaseModel
{
    static comparativeValue = new FloatField();

    static marketRentDifferential = new FloatField();

    static freeRentRentLoss = new FloatField();

    static vacantUnitRentLoss = new FloatField();

    static vacantUnitLeasupCosts = new FloatField();

    static amortizedCapitalInvestment = new FloatField();
    
    static valuation = new FloatField();
    static valuationRounded = new FloatField();
}

export default DirectComparisonValuation;


import GenericField from "./GenericField";
import ModelField from "./ModelField";
import ListField from "./ListField";
import BaseModel from "./BaseModel";


class DirectComparisonValuation extends BaseModel
{
    static comparativeValue = new GenericField();
    static valuation = new GenericField();
    static valuationRounded = new GenericField();
}

export default DirectComparisonValuation;


import GenericField from "./GenericField";
import ModelField from "./ModelField";
import ListField from "./ListField";
import BaseModel from "./BaseModel";


class DirectComparisonInputs extends BaseModel
{
    static pricePerSquareFoot = new GenericField();

    static modifiers = new GenericField();
}

export default DirectComparisonInputs;


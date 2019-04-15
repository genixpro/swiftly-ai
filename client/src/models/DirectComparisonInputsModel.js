import GenericField from "./GenericField";
import BaseModel from "./BaseModel";
import ListField from "./ListField";
import ModelField from "./ModelField";


class DirectComparisonModifier extends BaseModel
{
    static modifierName = new GenericField("name");
    static amount = new GenericField();
}

class DirectComparisonInputs extends BaseModel
{
    static pricePerSquareFoot = new GenericField();

    static modifiers = new ListField(new ModelField(DirectComparisonModifier));
}

export default DirectComparisonInputs;
export {DirectComparisonInputs, DirectComparisonModifier};


import BaseModel from "../orm/BaseModel";
import ListField from "../orm/ListField";
import ModelField from "../orm/ModelField";
import StringField from "../orm/StringField";
import FloatField from "../orm/FloatField";


class DirectComparisonModifier extends BaseModel
{
    static modifierName = new StringField("name");
    static amount = new FloatField();
}

class DirectComparisonInputs extends BaseModel
{
    static pricePerSquareFoot = new FloatField();

    static pricePerAcreLand = new FloatField();
    static pricePerSquareFootLand = new FloatField();
    static pricePerSquareFootBuildableArea = new FloatField();
    static pricePerBuildableUnit = new FloatField();
    static noiPSFMultiple = new FloatField();

    static directComparisonMetric = new StringField();

    static modifiers = new ListField(new ModelField(DirectComparisonModifier));
}

export default DirectComparisonInputs;
export {DirectComparisonInputs, DirectComparisonModifier};


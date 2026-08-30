import BaseModel from "../orm/BaseModel";
import ListField from "../orm/ListField";
import ModelField from "../orm/ModelField";
import StringField from "../orm/StringField";
import FloatField from "../orm/FloatField";
import BoolField from "../orm/BoolField";


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
    static noiPSFPricePerSquareFoot = new FloatField();
    static pricePerUnit = new FloatField();

    static directComparisonMetric = new StringField();

    static modifiers = new ListField(new ModelField(DirectComparisonModifier));

    static applyVacantUnitLeasingCosts = new BoolField();
    static applyVacantUnitRentLoss = new BoolField();
    static applyFreeRentLoss = new BoolField();
    static applyAmortization = new BoolField();
    static applyMarketRentDifferential = new BoolField();
}

export default DirectComparisonInputs;
export {DirectComparisonInputs, DirectComparisonModifier};


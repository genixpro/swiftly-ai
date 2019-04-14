import GenericField from "./GenericField";
import ModelField from "./ModelField";
import ListField from "./ListField";
import BaseModel from "./BaseModel";


class MarketRentModel extends BaseModel
{
    static marketRentName = new GenericField("name");
    static amountPSF = new GenericField();
}

export default MarketRentModel;


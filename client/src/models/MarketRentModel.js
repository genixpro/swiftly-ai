import BaseModel from "../orm/BaseModel";
import StringField from "../orm/StringField";
import FloatField from "../orm/FloatField";


class MarketRentModel extends BaseModel
{
    static marketRentName = new StringField("name");
    static amountPSF = new FloatField();
}

export default MarketRentModel;


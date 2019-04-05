import GenericField from "./GenericField";
import ModelField from "./ModelField";
import ListField from "./ListField";
import BaseModel from "./BaseModel";


class StabilizedStatementInputsModel extends BaseModel
{
    static capitalizationRate = new GenericField();
    static vacancyRate = new GenericField();
}

export default StabilizedStatementInputsModel;


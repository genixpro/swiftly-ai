import IdField from "./IdField";
import GenericField from "./GenericField";
import BaseModel from "./BaseModel";

class ZoneModel extends BaseModel
{
    static _id = new IdField();
    static zoneName = new GenericField();
    static description = new GenericField();
}

export default ZoneModel;

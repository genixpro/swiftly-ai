import IdField from "../orm/IdField";
import BaseModel from "../orm/BaseModel";
import StringField from "../orm/StringField";

class ZoneModel extends BaseModel
{
    static _id = new IdField();
    static owner = new StringField();
    static zoneName = new StringField();
    static description = new StringField();
}

export default ZoneModel;

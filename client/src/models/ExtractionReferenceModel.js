import BaseModel from "../orm/BaseModel";
import FloatField from "../orm/FloatField";
import BoolField from "../orm/BoolField";
import StringField from "../orm/StringField";
import ListField from "../orm/ListField";
import IntField from "../orm/IntField";


class ExtractionReference extends BaseModel
{
    static appraisalId = new StringField();

    static fileId = new StringField();

    static wordIndexes = new ListField(new IntField());

    static pageNumbers = new ListField(new IntField());

}

export default ExtractionReference;




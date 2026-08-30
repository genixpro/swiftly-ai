import IdField from "../orm/IdField";
import GenericField from "../orm/GenericField";
import ModelField from "../orm/ModelField";
import ListField from "../orm/ListField";
import BaseModel from "../orm/BaseModel";
import StringField from "../orm/StringField";
import IntField from "../orm/IntField";
import FloatField from "../orm/FloatField";

class WordModel extends BaseModel
{
    static word = new StringField();
    static page = new IntField();
    static lineNumber = new IntField();
    static documentLineNumber = new IntField();

    static column = new IntField();
    static documentColumn = new IntField();

    static index = new IntField();
    static left = new FloatField();
    static right = new FloatField();
    static top = new FloatField();
    static bottom = new FloatField();

    get height()
    {
        return this.bottom - this.top;
    }

    get width()
    {
        return this.right - this.left;
    }

}


class FileModel extends BaseModel
{
    static ignoredServerFields = ["path"];
    static _id = new IdField();
    static fileName = new GenericField();
    static owner = new StringField();
    static reviewStatus = new StringField();
    static extractionJobId = new StringField();
    static extractionError = new StringField();
    static appraisalId = new GenericField();
    static fileType = new GenericField();
    static hash = new StringField();
    static extractedData = new GenericField();
    static extraction = new GenericField();
    static tenantLeaseRows = new GenericField();
    static incomeExpenseRows = new GenericField();
    static comparableSales = new GenericField();

    static images = new ListField(new GenericField());
    static words = new ListField(new ModelField(WordModel));
    static pages = new GenericField();
    static pageTypes = new ListField(new GenericField());
}

export default FileModel;

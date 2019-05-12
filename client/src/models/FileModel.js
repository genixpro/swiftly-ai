import IdField from "../orm/IdField";
import GenericField from "../orm/GenericField";
import ModelField from "../orm/ModelField";
import ListField from "../orm/ListField";
import BaseModel from "../orm/BaseModel";
import StringField from "../orm/StringField";
import IntField from "../orm/IntField";
import FloatField from "../orm/FloatField";
import DictField from "../orm/DictField";

class WordModel extends BaseModel
{
    constructor()
    {
        super(...arguments);

        if (this.groups['undefined'])
        {
            delete this.groups['undefined'];
        }
    }

    static word = new StringField();
    static page = new IntField();
    static lineNumber = new IntField();
    static documentLineNumber = new IntField();

    static column = new IntField();
    static index = new IntField();
    static left = new FloatField();
    static right = new FloatField();
    static top = new FloatField();
    static bottom = new FloatField();

    static textType = new StringField();

    static groups = new DictField(new StringField());
    static groupProbabilities = new DictField(new DictField(new FloatField()));
    static groupNumbers = new DictField(new IntField());

    static classification = new StringField();
    static classificationProbabilities = new DictField(new FloatField());
    static modifiers = new ListField(new StringField());
    static modifierProbabilities = new DictField(new FloatField());
}


class FileModel extends BaseModel
{
    static _id = new IdField();
    static fileName = new GenericField();
    static owner = new StringField();
    static reviewStatus = new StringField();
    static appraisalId = new GenericField();
    static fileType = new GenericField();

    static images = new ListField(new GenericField());
    static words = new ListField(new ModelField(WordModel));
    static pages = new GenericField();
    static pageTypes = new ListField(new GenericField());
}

export default FileModel;

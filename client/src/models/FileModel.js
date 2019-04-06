import IdField from "./IdField";
import GenericField from "./GenericField";
import ModelField from "./ModelField";
import ListField from "./ListField";
import BaseModel from "./BaseModel";

class WordModel extends BaseModel
{
    static word = new GenericField();
    static page = new GenericField();
    static lineNumber = new GenericField();

    static columnLeft = new GenericField();
    static columnRight = new GenericField();
    static index = new GenericField();
    static left = new GenericField();
    static right = new GenericField();
    static top = new GenericField();
    static bottom = new GenericField();
    static classification = new GenericField();
    static classificationProbabilities = new GenericField();
    static modifiers = new GenericField();
    static modifierProbabilities = new GenericField();
}


class FileModel extends BaseModel
{
    static _id = new IdField();
    static fileName = new GenericField();
    static appraisalId = new GenericField();
    static fileType = new GenericField();

    static images = new ListField(new GenericField());
    static words = new ListField(new ModelField(WordModel));
    static pages = new GenericField();
    static pageTypes = new ListField(new GenericField());
}

export default FileModel;

import IdField from "./IdField";
import GenericField from "./GenericField";
import ModelField from "./ModelField";
import ListField from "./ListField";
import BaseModel from "./BaseModel";

class ComparableLeaseModel extends BaseModel
{
    static _id = new IdField();
    static comparableName = new GenericField("name");
    static address = new GenericField();
    static location = new GenericField();
    static propertyType = new GenericField();
    static sizeOfUnit = new GenericField();
    static yearlyRent = new GenericField();
    static description = new GenericField();
    static leaseDate = new GenericField();
    static rentType = new GenericField();
    static propertyTags = new ListField(new GenericField());

}

export default ComparableLeaseModel;

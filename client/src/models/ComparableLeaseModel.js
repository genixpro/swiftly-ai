import IdField from "./IdField";
import GenericField from "./GenericField";
import ModelField from "./ModelField";
import ListField from "./ListField";
import DateField from "./DateField";
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
    static leaseDate = new DateField();
    static rentType = new GenericField();
    static tenantName = new GenericField();
    static propertyTags = new ListField(new GenericField());

    static taxesMaintenanceInsurance = new GenericField();

    static tenantInducements = new GenericField();
    static freeRent = new GenericField();

    static escalations = new GenericField();
}

export default ComparableLeaseModel;

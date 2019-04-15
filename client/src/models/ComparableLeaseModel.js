import IdField from "./IdField";
import GenericField from "./GenericField";
import ListField from "./ListField";
import DateField from "./DateField";
import BaseModel from "./BaseModel";
import _ from "underscore";

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

    static floorNumber = new GenericField();
    static retailLocationType = new GenericField();
    static clearCeilingHeight = new GenericField();
    static shippingDoors = new GenericField();

    static sortComparables(comparables, sort)
    {
        if (sort)
        {
            const field = sort.substr(1);
            const direction = sort.substr(0, 1);

            const sorted = _.sortBy(comparables, (comp) => comp[field]);

            if (direction === "-")
            {
                return sorted.reverse();
            }
            else
            {
                return sorted;
            }
        }
        return comparables;
    }
}

export default ComparableLeaseModel;

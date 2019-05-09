import IdField from "../orm/IdField";
import GenericField from "../orm/GenericField";
import ListField from "../orm/ListField";
import DateField from "../orm/DateField";
import BaseModel from "../orm/BaseModel";
import _ from "underscore";
import StringField from "../orm/StringField";
import FloatField from "../orm/FloatField";
import ModelField from "../orm/ModelField";

class RentEscalation extends BaseModel
{
    static startYear = new FloatField();
    static endYear = new FloatField();
    static yearlyRent = new FloatField();
}

class ComparableLeaseModel extends BaseModel
{
    static _id = new IdField();
    static owner = new StringField();
    static address = new StringField();
    static location = new GenericField();
    static imageUrl = new StringField();
    static propertyType = new StringField();
    static sizeOfUnit = new FloatField();
    static rentEscalations = new ListField(new ModelField(RentEscalation));

    static description = new StringField();
    static leaseDate = new DateField();
    static rentType = new StringField();
    static tenantName = new StringField();
    static propertyTags = new ListField(new StringField());

    static taxesMaintenanceInsurance = new FloatField();

    static tenantInducements = new StringField();
    static freeRent = new StringField();

    static floorNumber = new FloatField();
    static retailLocationType = new StringField();
    static clearCeilingHeight = new StringField();
    static shippingDoors = new StringField();

    static remarks = new StringField();

    get startingYearlyRent()
    {
        if (this.rentEscalations && this.rentEscalations.length > 0 && this.rentEscalations[0].yearlyRent)
        {
            return this.rentEscalations[0].yearlyRent;
        }
        return null;
    }

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
export {ComparableLeaseModel, RentEscalation}
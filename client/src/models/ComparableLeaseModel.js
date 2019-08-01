import IdField from "../orm/IdField";
import GenericField from "../orm/GenericField";
import ListField from "../orm/ListField";
import DateField from "../orm/DateField";
import BaseModel from "../orm/BaseModel";
import _ from "underscore";
import StringField from "../orm/StringField";
import FloatField from "../orm/FloatField";
import IntField from "../orm/IntField";
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
    static imageUrl = new StringField(); // DEPRECATED.
    static imageUrls = new ListField(new StringField());
    static captions = new ListField(new StringField());
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
    static freeRentMonths = new IntField();
    static freeRentType = new StringField();

    static floorNumber = new FloatField();
    static retailLocationType = new StringField();
    static clearCeilingHeight = new FloatField();
    static finishedOfficePercentage = new FloatField();
    static shippingDoors = new StringField();

    static shippingDoorsTruckLevel = new FloatField();
    static shippingDoorsDoubleMan = new FloatField();
    static shippingDoorsDriveIn = new FloatField();

    static remarks = new StringField();
    static tenancyType = new StringField();

    initialize()
    {
        if (this.captions && this.captions.length < this.imageUrls.length)
        {
            const captions = this.captions;
            while (captions.length < this.imageUrls.length)
            {
                captions.push("");
            }
        }
    }

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
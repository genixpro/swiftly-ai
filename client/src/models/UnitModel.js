import GenericField from "../orm/GenericField";
import ModelField from "../orm/ModelField";
import ListField from "../orm/ListField";
import BaseModel from "../orm/BaseModel";
import StringField from "../orm/StringField";
import DateField from "../orm/DateField";
import _ from "underscore";
import FloatField from "../orm/FloatField";


class TenancyModel extends BaseModel
{
    static tenantName = new StringField("name", "New Tenant");
    static monthlyRent = new FloatField("monthlyRent", 0);
    static yearlyRent = new FloatField("yearlyRent", 0);
    static rentType = new StringField("rentType", "net");
    static startDate = new DateField("startDate", () => new Date());
    static endDate = new DateField("endDate", () => new Date());
    static freeRentMonths = new FloatField("freeRentMonths", 0);
    static recoveryStructure = new StringField("recoveryStructure", "Default");

    get yearlyRentPSF()
    {
        return this.yearlyRent / this.parent.squareFootage;
    }

    set yearlyRentPSF(newValue)
    {
        this.yearlyRent = newValue * this.parent.squareFootage;
        this.monthlyRent = this.yearlyRent / 12.0;
        this.setDirtyField("yearlyRent");
    }
}


class UnitModel extends BaseModel
{
    constructor(data, parent, fieldName)
    {
        super(data, parent, fieldName);

        if (this.tenancies.length === 0)
        {
            this.tenancies.push(new TenancyModel({name: "Vacant"}, this, "tenancies"))
        }

        this.setDirtyField("tenancies");
    }

    static unitNumber = new StringField("unitNumber", "new");
    static floorNumber = new FloatField("floorNumber", 1);
    static squareFootage = new FloatField("squareFootage", 1);
    static tenancies = new ListField(new ModelField(TenancyModel));
    static marketRent = new StringField();
    static leasingCostStructure = new StringField("leasingCostStructure", "Default");
    static remarks = new StringField();

    get currentTenancy()
    {
        for(let tenancy of this.tenancies)
        {
            if (tenancy.startDate !== null && !_.isUndefined(tenancy.startDate) && Date.now() >= tenancy.startDate.getTime() && tenancy.endDate !== null && !_.isUndefined(tenancy.endDate) && Date.now() <= tenancy.endDate.getTime())
            {
                return tenancy;
            }
        }

        const sorted = _.sortBy(this.tenancies, (tenancy) => tenancy.startDate ? tenancy.startDate.getTime() : Date.now());
        return sorted[sorted.length - 1];
    }
}

export default UnitModel;
export {UnitModel, TenancyModel}


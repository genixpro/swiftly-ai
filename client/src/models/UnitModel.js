import GenericField from "./GenericField";
import ModelField from "./ModelField";
import ListField from "./ListField";
import BaseModel from "./BaseModel";
import StringField from "./StringField";
import DateField from "./DateField";
import _ from "underscore";


class TenancyModel extends BaseModel
{
    static tenantName = new StringField("name");
    static monthlyRent = new GenericField();
    static yearlyRent = new GenericField();
    static rentType = new StringField();
    static startDate = new DateField();
    static endDate = new DateField();
    static freeRentMonths = new GenericField();
    static managementRecoveryPercentage = new GenericField();
    static managementRecoveryField = new GenericField();

    get yearlyRentPSF()
    {
        return this.yearlyRent / this.parent.squareFootage;
    }

    set yearlyRentPSF(newValue)
    {
        this.yearlyRent = newValue * this.parent.squareFootage;
        this.monthlyRent = this.yearlyRent / 12.0;
    }
}


class UnitModel extends BaseModel
{
    constructor(data, parent)
    {
        super(data, parent);

        if (this.tenancies.length === 0)
        {
            this.tenancies.push(new TenancyModel({}, this))
        }

    }

    static unitNumber = new StringField();
    static floorNumber = new GenericField();
    static squareFootage = new GenericField();
    static tenancies = new ListField(new ModelField(TenancyModel));
    static currentTenancy = new ModelField(TenancyModel);
    static marketRent = new StringField();
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



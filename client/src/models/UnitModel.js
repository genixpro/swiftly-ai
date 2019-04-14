import GenericField from "./GenericField";
import ModelField from "./ModelField";
import ListField from "./ListField";
import BaseModel from "./BaseModel";
import StringField from "./StringField";


class TenancyModel extends BaseModel
{
    static tenantName = new StringField("name");
    static monthlyRent = new GenericField();
    static yearlyRent = new GenericField();
    static rentType = new StringField();
    static startDate = new GenericField();
    static endDate = new GenericField();

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
    static unitNumber = new StringField();
    static floorNumber = new GenericField();
    static squareFootage = new GenericField();
    static tenancies = new ListField(new ModelField(TenancyModel));
    static currentTenancy = new ModelField(TenancyModel);
    static marketRent = new StringField();
    static remarks = new StringField()
}

export default UnitModel;



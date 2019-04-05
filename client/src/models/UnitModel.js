import GenericField from "./GenericField";
import ModelField from "./ModelField";
import ListField from "./ListField";
import BaseModel from "./BaseModel";


class TenancyModel extends BaseModel
{
    static tenantName = new GenericField("name");
    static monthlyRent = new GenericField();
    static yearlyRent = new GenericField();
    static rentType = new GenericField();
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
    static unitNumber = new GenericField();
    static floorNumber = new GenericField();
    static squareFootage = new GenericField();
    static tenancies = new ListField(new ModelField(TenancyModel));
    static currentTenancy = new ModelField(TenancyModel);
    static remarks = new GenericField()
}

export default UnitModel;



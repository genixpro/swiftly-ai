import IdField from "./IdField";
import GenericField from "./GenericField";
import ModelField from "./ModelField";
import ListField from "./ListField";
import BaseModel from "./BaseModel";
import DateField from "./DateField";

class ComparableSaleModel extends BaseModel
{
    static _id = new IdField();
    static comparableName = new GenericField("name");
    static address = new GenericField();
    static location = new GenericField();
    static propertyType = new GenericField();

    static netOperatingIncome = new GenericField();
    static capitalizationRate = new GenericField();
    static salePrice = new GenericField();
    static sizeSquareFootage = new GenericField();
    static taxesMaintenanceInsurancePSF = new GenericField();
    static vacancyRate = new GenericField();
    static saleDate = new DateField();
    static propertyTags = new ListField(new GenericField());
    static purchaser = new GenericField();

    static vendor = new GenericField();

    static tenants = new GenericField();

    static additionalInfo = new GenericField();
    static constructionDate = new GenericField();

    static siteArea = new GenericField();

    static parking = new GenericField();
}

export default ComparableSaleModel;

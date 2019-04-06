import IdField from "./IdField";
import GenericField from "./GenericField";
import ModelField from "./ModelField";
import ListField from "./ListField";
import BaseModel from "./BaseModel";

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
    static saleDate = new GenericField();
}

export default ComparableSaleModel;

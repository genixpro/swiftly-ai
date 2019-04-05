import GenericField from "./GenericField";
import ModelField from "./ModelField";
import ListField from "./ListField";
import UnitModel from "./UnitModel";
import IncomeStatementModel from "./IncomeStatementModel";
import DiscountedCashFlowInputsModel from "./DiscountedCashFlowInputsModel";
import DiscountedCashFlowModel from "./DiscountedCashFlowModel";
import AppraisalValidationResultModel from "./AppraisalValidationResultModel";
import StabilizedStatementInputsModel from "./StabilizedStatementInputsModel";
import StabilizedStatementModel from "./StabilizedStatementModel";
import BaseModel from "./BaseModel";

class AppraisalModel extends BaseModel
{
    static _id = new GenericField();
    static appraisalName = new GenericField("name");
    static address = new GenericField();
    static location = new GenericField();
    static propertyType = new GenericField();
    static industrialSubType = new GenericField();
    static landSubType = new GenericField();
    static sizeOfBuilding = new GenericField();
    static sizeOfLand = new GenericField();
    static legalDescription = new GenericField();
    static zoning = new GenericField();
    static units = new ListField(new ModelField(UnitModel));
    static incomeStatement = new ModelField(IncomeStatementModel);
    static discountedCashFlowInputs = new ModelField(DiscountedCashFlowInputsModel);
    static discountedCashFlow = new ModelField(DiscountedCashFlowModel);
    static validationResult = new ModelField(AppraisalValidationResultModel);
    static comparableSales = new ListField(new GenericField());
    static comparableLeases = new ListField(new GenericField());
    static stabilizedStatementInputs = new ListField(StabilizedStatementInputsModel);
    static stabilizedStatement = new ModelField(StabilizedStatementModel)
}

export default AppraisalModel;



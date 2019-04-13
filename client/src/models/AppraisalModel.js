import IdField from "./IdField";
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
import DirectComparisonValuationModel from "./DirectComparisonValuationModel";
import DirectComparisonInputsModel from "./DirectComparisonInputsModel";
import BaseModel from "./BaseModel";

class AppraisalModel extends BaseModel
{
    static _id = new IdField();
    static appraisalName = new GenericField("name");
    static address = new GenericField();
    static location = new GenericField();
    static imageUrl = new GenericField();
    static propertyType = new GenericField();
    static industrialSubType = new GenericField();
    static landSubType = new GenericField();
    static sizeOfBuilding = new GenericField();
    static sizeOfLand = new GenericField();
    static legalDescription = new GenericField();
    static zoning = new GenericField();
    static propertyTags = new ListField(new GenericField());
    static units = new ListField(new ModelField(UnitModel));
    static incomeStatement = new ModelField(IncomeStatementModel);
    static discountedCashFlowInputs = new ModelField(DiscountedCashFlowInputsModel);
    static discountedCashFlow = new ModelField(DiscountedCashFlowModel);
    static validationResult = new ModelField(AppraisalValidationResultModel);
    static comparableSales = new ListField(new GenericField());
    static comparableLeases = new ListField(new GenericField());
    static stabilizedStatementInputs = new ModelField(StabilizedStatementInputsModel);
    static stabilizedStatement = new ModelField(StabilizedStatementModel);
    static directComparisonInputs = new ModelField(DirectComparisonInputsModel);
    static directComparisonValuation = new ModelField(DirectComparisonValuationModel);
}

export default AppraisalModel;



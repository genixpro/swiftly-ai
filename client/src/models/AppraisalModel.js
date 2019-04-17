import IdField from "../orm/IdField";
import GenericField from "../orm/GenericField";
import ModelField from "../orm/ModelField";
import ListField from "../orm/ListField";
import UnitModel from "./UnitModel";
import IncomeStatementModel from "./IncomeStatementModel";
import DiscountedCashFlowInputsModel from "./DiscountedCashFlowInputsModel";
import DiscountedCashFlowModel from "./DiscountedCashFlowModel";
import AppraisalValidationResultModel from "./AppraisalValidationResultModel";
import StabilizedStatementInputsModel from "./StabilizedStatementInputsModel";
import StabilizedStatementModel from "./StabilizedStatementModel";
import DirectComparisonValuationModel from "./DirectComparisonValuationModel";
import DirectComparisonInputsModel from "./DirectComparisonInputsModel";
import MarketRentModel from "./MarketRentModel";
import RecoveryStructureModel from "./RecoveryStructureModel";
import BaseModel from "../orm/BaseModel";
import AmortizationScheduleModel from "./AmortizationScheduleModel";
import StringField from "../orm/StringField";
import FloatField from "../orm/FloatField";
import DateField from "../orm/DateField";

class AppraisalModel extends BaseModel
{
    static _id = new IdField();
    static appraisalName = new StringField("name");
    static address = new StringField();
    static location = new GenericField();
    static imageUrl = new StringField();
    static effectiveDate = new DateField();
    static propertyType = new StringField();
    static industrialSubType = new StringField();
    static landSubType = new StringField();
    static sizeOfBuilding = new FloatField();
    static sizeOfLand = new FloatField();
    static legalDescription = new StringField();
    static zoning = new StringField();
    static propertyTags = new ListField(new StringField());
    static units = new ListField(new ModelField(UnitModel));
    static incomeStatement = new ModelField(IncomeStatementModel);
    static discountedCashFlowInputs = new ModelField(DiscountedCashFlowInputsModel);
    static discountedCashFlow = new ModelField(DiscountedCashFlowModel);
    static validationResult = new ModelField(AppraisalValidationResultModel);
    static comparableSales = new ListField(new StringField());
    static comparableLeases = new ListField(new StringField());
    static stabilizedStatementInputs = new ModelField(StabilizedStatementInputsModel);
    static stabilizedStatement = new ModelField(StabilizedStatementModel);
    static directComparisonInputs = new ModelField(DirectComparisonInputsModel);
    static directComparisonValuation = new ModelField(DirectComparisonValuationModel);
    static marketRents = new ListField(new ModelField(MarketRentModel));
    static recoveryStructures = new ListField(new ModelField(RecoveryStructureModel));
    static amortizationSchedule = new ModelField(AmortizationScheduleModel);
}

export default AppraisalModel;



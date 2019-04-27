import BaseModel from "../orm/BaseModel";
import BoolField from "../orm/BoolField";


class AppraisalValidationResultModel extends BaseModel
{
    static hasBuildingInformation = new BoolField();
    static hasRentRoll = new BoolField();
    static hasIncomeStatement = new BoolField();

    static hasEscalations = new BoolField();
    static hasRents = new BoolField();
    static hasTenantNames = new BoolField();
    static hasUnitSizes = new BoolField();
    static hasLeaseTerms = new BoolField();

    static hasFinancialInfo = new BoolField();
    static hasExpenses = new BoolField();
    static hasTaxes = new BoolField();
    static hasAdditionalIncome = new BoolField();
    static hasAmortizations = new BoolField();

    static hasPropertyType = new BoolField();
    static hasBuildingSize = new BoolField();
    static hasLotSize = new BoolField();
    static hasZoning = new BoolField();
    static hasAddress = new BoolField();
}


export default AppraisalValidationResultModel;



import GenericField from "./GenericField";
import BaseModel from "./BaseModel";


class AppraisalValidationResultModel extends BaseModel
{
    static hasBuildingInformation = new GenericField();
    static hasRentRoll = new GenericField();
    static hasIncomeStatement = new GenericField();
}


export default AppraisalValidationResultModel;



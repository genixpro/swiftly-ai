import GenericField from "../orm/GenericField";
import BaseModel from "../orm/BaseModel";
import BoolField from "../orm/BoolField";


class AppraisalValidationResultModel extends BaseModel
{
    static hasBuildingInformation = new BoolField();
    static hasRentRoll = new BoolField();
    static hasIncomeStatement = new BoolField();
}


export default AppraisalValidationResultModel;



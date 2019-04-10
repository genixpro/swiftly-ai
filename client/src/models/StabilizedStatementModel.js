import GenericField from "./GenericField";
import ModelField from "./ModelField";
import ListField from "./ListField";
import BaseModel from "./BaseModel";


class StabilizedStatementModel extends BaseModel
{
    static rentalIncome = new GenericField();

    static additionalIncome = new GenericField();

    static recoverableIncome = new GenericField();

    static potentialGrossIncome = new GenericField();

    static grossIncome = new GenericField();

    static vacancyDeduction = new GenericField();

    static effectiveGrossIncome = new GenericField();

    static operatingExpenses = new GenericField();

    static taxes = new GenericField();

    static managementExpenses = new GenericField();

    static structuralAllowance = new GenericField();

    static totalExpenses = new GenericField();

    static netOperatingIncome = new GenericField();

    static netOperatingIncomePSF = new GenericField();

    static valuation = new GenericField();

    static valuationRounded = new GenericField();
}

export default StabilizedStatementModel;

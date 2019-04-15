import GenericField from "../orm/GenericField";
import BaseModel from "../orm/BaseModel";
import FloatField from "../orm/FloatField";


class StabilizedStatementModel extends BaseModel
{
    static rentalIncome = new FloatField();

    static additionalIncome = new FloatField();

    static recoverableIncome = new FloatField();

    static potentialGrossIncome = new FloatField();

    static grossIncome = new FloatField();

    static vacancyDeduction = new FloatField();

    static effectiveGrossIncome = new FloatField();

    static operatingExpenses = new FloatField();

    static taxes = new FloatField();

    static managementExpenses = new FloatField();

    static structuralAllowance = new FloatField();

    static tmiTotal = new FloatField();

    static totalExpenses = new FloatField();

    static netOperatingIncome = new FloatField();

    static netOperatingIncomePSF = new FloatField();

    static capitalization = new FloatField();

    static valuation = new FloatField();

    static valuationRounded = new FloatField();

    static marketRentDifferential = new FloatField();

    static freeRentDifferential = new FloatField();

    static vacantUnitDifferential = new FloatField();

    static amortizationDifferential = new FloatField();
}

export default StabilizedStatementModel;


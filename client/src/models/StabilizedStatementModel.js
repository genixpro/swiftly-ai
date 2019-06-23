import BaseModel from "../orm/BaseModel";
import FloatField from "../orm/FloatField";
import StringField from "../orm/StringField";
import DictField from "../orm/DictField";
import ListField from "../orm/ListField";


class StabilizedStatementModel extends BaseModel
{
    static rentalIncome = new FloatField();

    static additionalIncome = new FloatField();

    static managementRecovery = new FloatField();

    static operatingExpenseRecovery = new FloatField();

    static taxRecovery = new FloatField();

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

    static capitalization = new FloatField();

    static valuation = new FloatField();

    static valuationRounded = new FloatField();

    static marketRentDifferential = new FloatField();

    static freeRentRentLoss = new FloatField();

    static vacantUnitRentLoss = new FloatField();

    static vacantUnitLeasupCosts = new FloatField();

    static amortizedCapitalInvestment = new FloatField();

    static calculationErrorFields = new ListField(new StringField());

    static calculationErrors = new DictField(new StringField());
}

export default StabilizedStatementModel;


import GenericField from "./GenericField";
import ModelField from "./ModelField";
import ListField from "./ListField";
import BaseModel from "./BaseModel";


class IncomeStatementItemModel extends BaseModel
{
    static itemName = new GenericField("name");
    static yearlyAmounts = new GenericField();
    static extractionReferences = new GenericField();
    static cashFlowType = new GenericField();
    static incomeStatementItemType = new GenericField();

    get yearlyAmountsPSF()
    {
        const psf = {};
        const size = this.parent.parent.sizeOfBuilding;

        Object.keys(this.yearlyAmounts).forEach((year) =>
        {
            psf[year] = this.yearlyAmounts[year] / size;
        });

        return psf;
    }

    set yearlyAmountsPSF(newYearlyPSF)
    {
        const yearly = {};

        const size = this.parent.parent.sizeOfBuilding;

        Object.keys(newYearlyPSF).forEach((year) =>
        {
            yearly[year] = newYearlyPSF[year] * size;
        });

        this.yearlyAmounts = yearly;
    }
}


class IncomeStatementModel extends BaseModel
{
    static years = new ListField(new GenericField());
    static incomes = new ListField(new ModelField(IncomeStatementItemModel));
    static expenses = new ListField(new ModelField(IncomeStatementItemModel));
}

export {IncomeStatementItemModel, IncomeStatementModel};
export default IncomeStatementModel;



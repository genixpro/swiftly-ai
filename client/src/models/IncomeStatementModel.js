import GenericField from "../orm/GenericField";
import ModelField from "../orm/ModelField";
import ListField from "../orm/ListField";
import BaseModel from "../orm/BaseModel";
import _ from "underscore";
import StringField from "../orm/StringField";
import DictField from "../orm/DictField";
import FloatField from "../orm/FloatField";


class IncomeStatementItemModel extends BaseModel
{
    static itemName = new StringField("name");
    static yearlyAmounts = new DictField(new FloatField());
    static yearlySourceTypes = new DictField(new StringField());
    static extractionReferences = new DictField(new DictField(new GenericField()));
    static cashFlowType = new StringField();
    static incomeStatementItemType = new StringField();

    get latestAmount()
    {
        return this.yearlyAmounts[_.max(Object.keys(this.yearlyAmounts))];
    }

    get machineName()
    {
        if (!this.name)
        {
            return "";
        }
        return this.name.replace(/\.\$/g, "");
    }

    get yearlyAmountsPSF()
    {
        const psf = {};
        const size = this.parent.parent.sizeOfBuilding;

        Object.keys(this.yearlyAmounts).forEach((year) =>
        {
            if (_.isNumber(size))
            {
                psf[year] = this.yearlyAmounts[year] / size;
            }
            else
            {
                psf[year] = null;
            }
        });

        return psf;
    }

    set yearlyAmountsPSF(newYearlyPSF)
    {
        const yearly = {};

        const size = this.parent.parent.sizeOfBuilding;

        Object.keys(newYearlyPSF).forEach((year) =>
        {
            if (_.isNumber(size))
            {
                if ((this.yearlyAmounts[year] / size).toFixed(2) !== newYearlyPSF[year].toFixed(2))
                {
                    yearly[year] = newYearlyPSF[year] * size;
                }
                else
                {
                    yearly[year] = this.yearlyAmounts[year];
                }
            }
            else
            {
                yearly[year] = this.yearlyAmounts[year];
            }
        });

        this.yearlyAmounts = yearly;
        this.setDirtyField("yearlyAmounts");
    }
}


class IncomeStatementModel extends BaseModel
{
    static years = new ListField(new FloatField());
    static yearlySourceTypes = new DictField(new StringField());
    static customYearTitles = new DictField(new StringField(), {});
    static incomes = new ListField(new ModelField(IncomeStatementItemModel));
    static expenses = new ListField(new ModelField(IncomeStatementItemModel));

    get latestYear()
    {
        if (this.years.length === 0)
        {
            return null;
        }
        return _.max(this.years);
    }

    calculateTotalExpenses(year, incomeStatementItemType)
    {
        if (this.years.indexOf(year) === -1)
        {
            return 0;
        }

        let total = 0;
        this.expenses.forEach((expense) =>
        {
            if ((expense.incomeStatementItemType === incomeStatementItemType || incomeStatementItemType === null) && expense.yearlyAmounts[year])
            {
                total += expense.yearlyAmounts[year];
            }
        });
        return total;
    }
}

export {IncomeStatementItemModel, IncomeStatementModel};
export default IncomeStatementModel;



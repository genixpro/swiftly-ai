import GenericField from "./GenericField";
import ModelField from "./ModelField";
import ListField from "./ListField";
import BaseModel from "./BaseModel";


class YearlyCashFlowItemModel extends BaseModel
{
    static itemName = new GenericField("name");
    static year = new GenericField();
    static relativeYear = new GenericField();
    static amount = new GenericField();
    static cashFlowType = new GenericField();

    get name()
    {
        return this.itemName;
    }

    set name(val)
    {
        this.itemName = val;
    }
}



class DiscountedCashFlowSummaryItemModel extends BaseModel
{
    static itemName = new GenericField("name");
    static amounts = new GenericField();
}


class DiscountedCashFlowSummaryModel extends BaseModel
{
    static years = new ListField(new GenericField());

    static incomes = new ListField(new ModelField(DiscountedCashFlowSummaryItemModel));
    static expenses = new ListField(new ModelField(DiscountedCashFlowSummaryItemModel));

    static incomeTotal = new ModelField(DiscountedCashFlowSummaryItemModel);
    static expenseTotal = new ModelField(DiscountedCashFlowSummaryItemModel);

    static netOperatingIncome = new ModelField(DiscountedCashFlowSummaryItemModel);
    static presentValue = new ModelField(DiscountedCashFlowSummaryItemModel);
}



class DiscountedCashFlowModel extends BaseModel
{
    static yearlyCashFlows = new ListField(new ModelField(YearlyCashFlowItemModel));
    static cashFlowSummary = new ModelField(DiscountedCashFlowSummaryModel)
}



export default DiscountedCashFlowModel;


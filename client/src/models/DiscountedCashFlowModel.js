import GenericField from "../orm/GenericField";
import ModelField from "../orm/ModelField";
import ListField from "../orm/ListField";
import BaseModel from "../orm/BaseModel";
import StringField from "../orm/StringField";
import FloatField from "../orm/FloatField";
import DictField from "../orm/DictField";


class YearlyCashFlowItemModel extends BaseModel
{
    static itemName = new StringField("name");
    static year = new FloatField();
    static relativeYear = new FloatField();
    static amount = new FloatField();
    static cashFlowType = new StringField();

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
    static itemName = new StringField("name");
    static amounts = new DictField(new FloatField());
}


class DiscountedCashFlowSummaryModel extends BaseModel
{
    static years = new ListField(new FloatField());

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


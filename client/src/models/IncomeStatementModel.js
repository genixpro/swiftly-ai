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
}


class IncomeStatementModel extends BaseModel
{
    static years = new ListField(new GenericField());
    static incomes = new ListField(new ModelField(IncomeStatementItemModel));
    static expenses = new ListField(new ModelField(IncomeStatementItemModel));
}

export default IncomeStatementModel;



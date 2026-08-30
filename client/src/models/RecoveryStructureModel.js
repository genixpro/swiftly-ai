import BaseModel from "../orm/BaseModel";
import StringField from "../orm/StringField";
import FloatField from "../orm/FloatField";
import DictField from "../orm/DictField";
import _ from "underscore";

class RecoveryStructureModel extends BaseModel
{
    static structureName = new StringField("name");

    static managementRecoveryMode = new StringField("managementRecoveryMode", "operatingExpenses");

    static managementRecoveryOperatingPercentage = new FloatField();

    static managementRecoveries = new DictField(new FloatField(), {});

    static calculatedManagementRecoveryBaseValue = new FloatField();

    static calculatedManagementRecoveryTotal = new FloatField();

    static calculatedManagementRecoveries = new DictField(new FloatField(), {});

    static calculatedManagementRecoveryBaseFieldValue = new FloatField("calculatedManagementRecoveryBaseFieldValue", 0);

    static expenseRecoveries = new DictField(new FloatField());

    static taxRecoveries = new DictField(new FloatField());

    static calculatedExpenseRecoveries = new DictField(new FloatField(), {});

    static calculatedTaxRecoveries = new DictField(new FloatField(), {});

    get isDefault()
    {
        return this.name === RecoveryStructureModel.defaultRecoveryName || this.name === "Default";
    }

    static get defaultRecoveryName()
    {
        return "Standard";
    }

    get calculatedTotalRecovery()
    {
        let total = 0;
        if (_.isNumber(this.calculatedManagementRecoveryTotal))
        {
            total += this.calculatedManagementRecoveryTotal;
        }

        if (this.calculatedExpenseRecoveries)
        {
            Object.values(this.calculatedExpenseRecoveries).forEach((amount) =>
            {
                total += amount;
            })
        }

        if (this.calculatedTaxRecoveries)
        {
            Object.values(this.calculatedTaxRecoveries).forEach((amount) =>
            {
                total += amount;
            })
        }

        return total;
    }

}

export default RecoveryStructureModel;


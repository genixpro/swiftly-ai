import ModelField from "../orm/ModelField";
import ListField from "../orm/ListField";
import BaseModel from "../orm/BaseModel";
import StringField from "../orm/StringField";
import DateField from "../orm/DateField";
import _ from "underscore";
import FloatField from "../orm/FloatField";
import BoolField from "../orm/BoolField";
import moment from "moment";

class TenancyModel extends BaseModel
{
    static tenantName = new StringField("name", "New Tenant");
    static monthlyRent = new FloatField("monthlyRent", 0);
    static yearlyRent = new FloatField("yearlyRent", 0);
    static rentType = new StringField("rentType", "net");
    static freeRentType = new StringField("freeRentType", "net");
    static startDate = new DateField("startDate", () => new Date());
    static endDate = new DateField("endDate", () => new Date());
    static freeRentMonths = new FloatField("freeRentMonths", 0);
    static recoveryStructure = new StringField("recoveryStructure", "Standard");

    get yearlyRentPSF()
    {
        return this.yearlyRent / this.parent.squareFootage;
    }

    set yearlyRentPSF(newValue)
    {
        this.yearlyRent = newValue * this.parent.squareFootage;
        this.monthlyRent = this.yearlyRent / 12.0;
        this.setDirtyField("yearlyRent");
    }
}


class UnitModel extends BaseModel
{
    constructor(data, parent, fieldName, check)
    {
        super(data, parent, fieldName, check);

        if (this.tenancies.length === 0)
        {
            this.tenancies.push(TenancyModel.create({name: "Vacant"}, this, "tenancies"))
        }

        this.setDirtyField("tenancies");
    }

    static unitNumber = new StringField("unitNumber", "new");
    static floorNumber = new FloatField("floorNumber", 1);
    static squareFootage = new FloatField("squareFootage", 1);
    static tenancies = new ListField(new ModelField(TenancyModel));
    static marketRent = new StringField();
    static leasingCostStructure = new StringField("leasingCostStructure", "Default");
    static remarks = new StringField();

    static shouldApplyMarketRentDifferential = new BoolField("shouldApplyMarketRentDifferential", false);
    static shouldUseMarketRent = new BoolField("shouldUseMarketRent", false);
    static shouldTreatAsVacant = new BoolField("shouldTreatAsVacant", null);

    static calculatedManagementRecovery = new FloatField();
    static calculatedExpenseRecovery = new FloatField();
    static calculatedTaxRecovery = new FloatField();
    static calculatedMarketRentDifferential = new FloatField();
    static calculatedFreeRentLoss = new FloatField();
    static calculatedVacantUnitRentLoss = new FloatField();
    static calculatedVacantUnitLeasupCosts = new FloatField();
    static calculatedFreeRentMonths = new FloatField();
    static calculatedFreeRentNetAmount = new FloatField();

    resetCalculations()
    {
        this.calculatedManagementRecovery = null;
        this.calculatedExpenseRecovery = null;
        this.calculatedTaxRecovery = null;
        this.calculatedMarketRentDifferential = null;
        this.calculatedFreeRentLoss = null;
        this.calculatedVacantUnitRentLoss = null;
        this.calculatedVacantUnitLeasupCosts = null;
        this.calculatedFreeRentMonths = null;
        this.calculatedFreeRentNetAmount = null;
    }

    get marketRentAmount()
    {
        for (let marketRent of this.parent.marketRents)
        {
            if (marketRent.name === this.marketRent)
            {
                return marketRent.amountPSF;
            }
        }
        return null;
    }

    get stabilizedRentPSF()
    {
        if (this.shouldUseMarketRent && this.marketRent)
        {
            return this.marketRentAmount;
        }
        else
        {
            return this.currentTenancy.yearlyRentPSF;
        }
    }

    get stabilizedRent()
    {
        return this.stabilizedRentPSF * this.squareFootage;
    }

    get isVacantForStabilizedStatement()
    {
        if(_.isNull(this.shouldTreatAsVacant))
        {
            return this.isVacantInFirstYear;
        }
        else
        {
            return this.shouldTreatAsVacant;
        }
    }

    get currentTenancy()
    {
        for(let tenancy of this.tenancies)
        {
            if (tenancy.startDate !== null && !_.isUndefined(tenancy.startDate) && Date.now() >= tenancy.startDate.getTime() && tenancy.endDate !== null && !_.isUndefined(tenancy.endDate) && Date.now() <= tenancy.endDate.getTime())
            {
                return tenancy;
            }
        }

        const sorted = _.sortBy(this.tenancies, (tenancy) => tenancy.startDate ? tenancy.startDate.getTime() : Date.now());
        return sorted[sorted.length - 1];
    }

    get isVacantInFirstYear()
    {
        const oneYearDate = Date.now() + (1000 * 60 * 60 * 24 * 365);

        if (this.tenancies.length > 0)
        {
            for(let tenancy of this.tenancies)
            {
                if (tenancy.startDate !== null && !_.isUndefined(tenancy.startDate) && oneYearDate >= tenancy.startDate.getTime() && tenancy.endDate !== null && !_.isUndefined(tenancy.endDate) && oneYearDate <= tenancy.endDate.getTime())
                {
                    if (tenancy.yearlyRent && tenancy.yearlyRent > 0)
                    {
                        return false;
                    }
                }
            }

            const sorted = _.sortBy(this.tenancies, (tenancy) => tenancy.startDate ? tenancy.startDate.getTime() : oneYearDate);
            const firstTenancy = sorted[sorted.length - 1];

            if (firstTenancy.yearlyRent && firstTenancy.yearlyRent > 0)
            {
                return false
            }

            return true;
        }
        else
        {
            return true;
        }
    }

    get calculatedTotalRecovery()
    {
        let total = 0;
        if (_.isNumber(this.calculatedManagementRecovery))
        {
            total += this.calculatedManagementRecovery;
        }

        if (_.isNumber(this.calculatedExpenseRecovery))
        {
            total += this.calculatedExpenseRecovery;
        }

        if (_.isNumber(this.calculatedTaxRecovery))
        {
            total += this.calculatedTaxRecovery;
        }

        return total;
    }


    static numberWithCommas(x, decimals) {
        if (!decimals)
        {
            decimals = 0;
        }

        return x.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    get computedDescription()
    {
        const dateFormat = "D MMMM, YYYY";

        let message = `Occupies ${UnitModel.numberWithCommas(this.squareFootage)} square feet`;

        let currentTenantName = this.currentTenancy.tenantName;

        let allRelevantTenancies = this.tenancies.filter((tenancy) =>
        {
            return tenancy.tenantName === currentTenantName;
        });

        allRelevantTenancies.sort((itemA, itemB) =>
        {
            if (itemA.startDate < itemB.startDate)
            {
                return -1;
            }
            if (itemA.startDate > itemB.startDate)
            {
                return 1;
            }
            return 0;
        });

        const startTenancy = allRelevantTenancies[0];
        const endTenancy = allRelevantTenancies[allRelevantTenancies.length - 1];

        let leaseYears = endTenancy.endDate.getFullYear() - startTenancy.startDate.getFullYear();

        message += ` pursuant to a ${leaseYears}-year lease commencing ${moment(startTenancy.startDate).format(dateFormat)} and expiring ${moment(endTenancy.endDate).format(dateFormat)}. `;

        if (allRelevantTenancies.length > 1)
        {
            const escalationYear = allRelevantTenancies[1].startDate.getFullYear() - allRelevantTenancies[0].startDate.getFullYear();
            message += `Annual net rent in year 1 was $${UnitModel.numberWithCommas(startTenancy.yearlyRent / this.squareFootage, 2)} per square foot which escalates in year ${escalationYear} to $${UnitModel.numberWithCommas(allRelevantTenancies[1].yearlyRent / this.squareFootage, 2)} per square foot.`;
        }
        else
        {
            message += `Annual net rent for the duration of the lease term is $${UnitModel.numberWithCommas(startTenancy.yearlyRent / this.squareFootage, 2)} per square foot.`;
        }

        return message;
    }
}

export default UnitModel;
export {UnitModel, TenancyModel}


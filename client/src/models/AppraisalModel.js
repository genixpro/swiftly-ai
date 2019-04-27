import IdField from "../orm/IdField";
import GenericField from "../orm/GenericField";
import ModelField from "../orm/ModelField";
import ListField from "../orm/ListField";
import UnitModel from "./UnitModel";
import IncomeStatementModel from "./IncomeStatementModel";
import DiscountedCashFlowInputsModel from "./DiscountedCashFlowInputsModel";
import DiscountedCashFlowModel from "./DiscountedCashFlowModel";
import AppraisalValidationResultModel from "./AppraisalValidationResultModel";
import StabilizedStatementInputsModel from "./StabilizedStatementInputsModel";
import StabilizedStatementModel from "./StabilizedStatementModel";
import DirectComparisonValuationModel from "./DirectComparisonValuationModel";
import DirectComparisonInputsModel from "./DirectComparisonInputsModel";
import MarketRentModel from "./MarketRentModel";
import RecoveryStructureModel from "./RecoveryStructureModel";
import BaseModel from "../orm/BaseModel";
import AmortizationScheduleModel from "./AmortizationScheduleModel";
import StringField from "../orm/StringField";
import FloatField from "../orm/FloatField";
import DateField from "../orm/DateField";
import LeasingCostStructureModel from "./LeasingCostStructureModel";
import _ from "underscore";

class AppraisalModel extends BaseModel
{
    static _id = new IdField();
    static appraisalName = new StringField("name");
    static address = new StringField();
    static owner = new StringField();

    static client = new StringField();
    static location = new GenericField();
    static imageUrl = new StringField();
    static effectiveDate = new DateField();
    static propertyType = new StringField();
    static industrialSubType = new StringField();
    static landSubType = new StringField();
    static sizeOfLand = new FloatField();
    static buildableArea = new FloatField();
    static buildableUnits = new FloatField();
    static legalDescription = new StringField();
    static zoning = new StringField();
    static propertyTags = new ListField(new StringField());
    static units = new ListField(new ModelField(UnitModel));
    static incomeStatement = new ModelField(IncomeStatementModel);
    static discountedCashFlowInputs = new ModelField(DiscountedCashFlowInputsModel);
    static discountedCashFlow = new ModelField(DiscountedCashFlowModel);
    static validationResult = new ModelField(AppraisalValidationResultModel);

    static comparableSalesCapRate = new ListField(new StringField(), []);
    static comparableSalesDCA = new ListField(new StringField(), []);

    static comparableLeases = new ListField(new StringField());
    static stabilizedStatementInputs = new ModelField(StabilizedStatementInputsModel);
    static stabilizedStatement = new ModelField(StabilizedStatementModel);
    static directComparisonInputs = new ModelField(DirectComparisonInputsModel);
    static directComparisonValuation = new ModelField(DirectComparisonValuationModel);
    static marketRents = new ListField(new ModelField(MarketRentModel));
    static recoveryStructures = new ListField(new ModelField(RecoveryStructureModel));
    static amortizationSchedule = new ModelField(AmortizationScheduleModel);
    static leasingCosts = new ListField(new ModelField(LeasingCostStructureModel));


    getEffectiveDate()
    {
        if (this.effectiveDate)
        {
            return this.effectiveDate;
        }
        return new Date();
    }

    get estimatedMarketRent()
    {
        let total = 0;
        for(let unit of this.units)
        {
            total += unit.marketRentAmount * unit.squareFootage;
        }

        return total;
    }

    get occupancyRate()
    {
        let total = 0;
        let totalOccupied = 0;
        for(let unit of this.units)
        {
            total += unit.squareFootage;
            if(!unit.isVacantForStabilizedStatement)
            {
                totalOccupied += unit.squareFootage;
            }
        }

        return totalOccupied / total;
    }

    get sizeOfBuilding()
    {
        return _.reduce(this.units, function(memo, num){ return memo + num.squareFootage; }, 0);
    }

    hasComparableSaleInCapRate(comp)
    {
        if (!comp._id)
        {
            return false;
        }

        if (!this.comparableSalesCapRate)
        {
            return false;
        }
        else
        {
            for (let i = 0; i < this.comparableSalesCapRate.length; i += 1)
            {
                if (this.comparableSalesCapRate[i] === comp._id)
                {
                    return true;
                }
            }
            return false;
        }
    }

    hasComparableSaleInDCA(comp)
    {
        if (!comp._id)
        {
            return false;
        }

        if (!this.comparableSalesDCA)
        {
            return false;
        }
        else
        {
            for (let i = 0; i < this.comparableSalesDCA.length; i += 1)
            {
                if (this.comparableSalesDCA[i] === comp._id)
                {
                    return true;
                }
            }
            return false;
        }
    }

    hasComparableSale(comp)
    {
        return this.hasComparableSaleInCapRate(comp) || this.hasComparableSaleInDCA(comp);
    }
}

export default AppraisalModel;



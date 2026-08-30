import React from 'react'
import {renderToString} from 'react-dom/server'
import readJSONInput from "./read_json_input";
import fs from "fs";
import Moment from 'react-moment';
import _ from "underscore";
import NumberFormat from 'react-number-format';
import StyledTable from "./styled_table";
import {Value, CurrencyValue, PercentValue, IntegerValue} from "./value";
import Spacer from "./spacer";
import FinancialTable from "./financial_table";
import renderDocument from "./render_doc";

class DirectComparisonTable extends React.Component
{
    render()
    {

        const rows = [];

        let sizeOfBuilding = 0;
        for(let unit of this.props.appraisal.units)
        {
            sizeOfBuilding += unit.squareFootage;
        }

        if (this.props.appraisal.directComparisonInputs.directComparisonMetric === 'psf')
        {
            rows.push({
                "label": <span>
                <IntegerValue left>{sizeOfBuilding || 0}</IntegerValue> sqft @ <CurrencyValue left cents={true}>{this.props.appraisal.directComparisonInputs ? this.props.appraisal.directComparisonInputs.pricePerSquareFoot : null}</CurrencyValue>
            </span>,
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.directComparisonValuation.comparativeValue}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }
        else if (this.props.appraisal.directComparisonInputs.directComparisonMetric === 'noi_multiple')
        {
            rows.push({
                "label": <span>
                <IntegerValue left>{sizeOfBuilding || 0}</IntegerValue> sqft @ <CurrencyValue left cents={true}>{this.props.appraisal.directComparisonInputs ? this.props.appraisal.directComparisonInputs.noiPSFPricePerSquareFoot : null}</CurrencyValue>
            </span>,
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.directComparisonValuation.comparativeValue}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }
        else if (this.props.appraisal.directComparisonInputs.directComparisonMetric === 'psf_land')
        {
            rows.push({
                "label": <span>
                <IntegerValue left>{this.props.appraisal.sizeOfLand * 43560 || 0}</IntegerValue> sqft @ <CurrencyValue left cents={true}>{this.props.appraisal.directComparisonInputs ? this.props.appraisal.directComparisonInputs.pricePerSquareFootLand : null}</CurrencyValue>
            </span>,
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.directComparisonValuation.comparativeValue}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }
        else if (this.props.appraisal.directComparisonInputs.directComparisonMetric === 'per_acre_land')
        {
            rows.push({
                "label": <span>
                <IntegerValue left>{this.props.appraisal.sizeOfLand || 0}</IntegerValue> acres @ <CurrencyValue left cents={false}>{this.props.appraisal.directComparisonInputs ? this.props.appraisal.directComparisonInputs.pricePerAcreLand : null}</CurrencyValue>
            </span>,
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.directComparisonValuation.comparativeValue}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }
        else if (this.props.appraisal.directComparisonInputs.directComparisonMetric === 'psf_buildable_area')
        {
            rows.push({
                "label": <span>
                <IntegerValue left>{this.props.appraisal.buildableArea || 0}</IntegerValue> psf @ <CurrencyValue left cents={true}>{this.props.appraisal.directComparisonInputs ? this.props.appraisal.directComparisonInputs.pricePerSquareFootBuildableArea : null}</CurrencyValue>
            </span>,
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.directComparisonValuation.comparativeValue}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }
        else if (this.props.appraisal.directComparisonInputs.directComparisonMetric === 'per_buildable_unit')
        {
            rows.push({
                "label": <span>
                <IntegerValue left>{this.props.appraisal.buildableUnits || 0}</IntegerValue> units @ <CurrencyValue left cents={true}>{this.props.appraisal.directComparisonInputs ? this.props.appraisal.directComparisonInputs.pricePerBuildableUnit : null}</CurrencyValue>
            </span>,
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.directComparisonValuation.comparativeValue}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }

        if (this.props.appraisal.directComparisonValuation.marketRentDifferential && this.props.appraisal.directComparisonInputs.applyMarketRentDifferential)
        {
            rows.push({
                "label": <span>
                Market Rent Differential, Discounted At @ <PercentValue left>{this.props.appraisal.directComparisonInputs.marketRentDifferentialDiscountRate}</PercentValue>
            </span>,
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.directComparisonValuation.marketRentDifferential}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }

        if (this.props.appraisal.directComparisonValuation.freeRentRentLoss && this.props.appraisal.directComparisonInputs.applyFreeRentLoss)
        {
            rows.push({
                "label": "Free Rent Loss",
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.directComparisonValuation.freeRentRentLoss}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }

        if (this.props.appraisal.directComparisonValuation.vacantUnitRentLoss && this.props.appraisal.directComparisonInputs.applyVacantUnitRentLoss)
        {
            rows.push({
                "label": "Vacant Unit Rent Loss",
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.directComparisonValuation.vacantUnitRentLoss}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }

        if (this.props.appraisal.directComparisonValuation.vacantUnitLeasupCosts && this.props.appraisal.directComparisonInputs.applyVacantUnitLeasingCosts)
        {
            rows.push({
                "label": "Vacant Unit Leasup Costs",
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.directComparisonValuation.vacantUnitLeasupCosts}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }

        if (this.props.appraisal.directComparisonValuation.amortizedCapitalInvestment && this.props.appraisal.directComparisonInputs.applyAmortization)
        {
            rows.push({
                "label": "Amortized Capital Investment",
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.directComparisonValuation.amortizedCapitalInvestment}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }

        this.props.appraisal.directComparisonInputs.modifiers.forEach((modifier) =>
        {
            rows.push({
                "label": modifier.name,
                "amount": <CurrencyValue cents={false}>{modifier.amount}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        });

        if (rows.length > 0)
        {
            // Set the very last modifier to a sumAfter
            rows[rows.length - 1]['mode'] = 'sumAfter';
        }

        rows.push({
            "label": "Estimated Value",
            "amount": null,
            "amountTotal": <CurrencyValue cents={false}>{this.props.appraisal.directComparisonValuation.valuation}</CurrencyValue>,
            "mode": "title"
        });

        rows.push({
            "label": "Rounded",
            "amount": null,
            "amountTotal": <CurrencyValue cents={false}>{this.props.appraisal.directComparisonValuation.valuationRounded}</CurrencyValue>,
            "mode": "data"
        });

        return (
            <FinancialTable rows={rows} />
        )
    }
}

export default DirectComparisonTable;

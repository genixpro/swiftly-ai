import React from 'react'
import {renderToString} from 'react-dom/server'
import readJSONInput from "./read_json_input";
import fs from "fs";
import Moment from 'react-moment';
import _ from "underscore";
import NumberFormat from 'react-number-format';
import CustomTable from "./styled_table";
import {Value, CurrencyValue, PercentValue, IntegerValue} from "./value";
import Spacer from "./spacer";
import FinancialTable from "./financial_table";
import renderDocument from "./render_doc";

class App extends React.Component
{
    render()
    {
        const headerStyle = {
            "textAlign": "center"
        };

        const subHeaderStyle = {
            "textAlign": "center"
        };

        const resultStyle = {
            "textAlign": "center",
            "fontStyle": "italic",
            "fontFamily": "monospace, serif",
            "fontSize": "14px",
            "letterSpacing": "-1px"
        };

        const rows = [];


        rows.push({
            "label": <span>
                <IntegerValue left>{this.props.appraisal.sizeOfBuilding}</IntegerValue> sqft @ <CurrencyValue left cents={true}>{this.props.appraisal.directComparisonInputs ? this.props.appraisal.directComparisonInputs.pricePerSquareFoot : null}</CurrencyValue>
            </span>,
            "amount": <CurrencyValue cents={false}>{this.props.appraisal.directComparisonValuation.comparativeValue}</CurrencyValue>,
            "amountTotal": null,
            "mode": "data"
        });

        if (this.props.appraisal.directComparisonValuation.marketRentDifferential)
        {
            rows.push({
                "label": <span>
                Market Rent Differential, Discounted At @ <PercentValue left>{this.props.appraisal.directComparisonValuationInputs.marketRentDifferentialDiscountRate}</PercentValue>
            </span>,
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.directComparisonValuation.marketRentDifferential}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }

        if (this.props.appraisal.directComparisonValuation.freeRentRentLoss)
        {
            rows.push({
                "label": "Free Rent Loss",
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.directComparisonValuation.freeRentRentLoss}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }

        if (this.props.appraisal.directComparisonValuation.vacantUnitRentLoss)
        {
            rows.push({
                "label": "Vacant Unit Rent Loss",
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.directComparisonValuation.vacantUnitRentLoss}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }

        if (this.props.appraisal.directComparisonValuation.vacantUnitLeasupCosts)
        {
            rows.push({
                "label": "Vacant Unit Leasup Costs",
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.directComparisonValuation.vacantUnitLeasupCosts}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }

        if (this.props.appraisal.directComparisonValuation.amortizedCapitalInvestment)
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

        // Set the very last modifier to a sumAfter
        rows[rows.length - 1]['mode'] = 'sumAfter';

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
            <html>
            <body>
            <br/>
            <h1 style={headerStyle}>Direct Comparison Valuation</h1>
            <h2 style={subHeaderStyle}>{this.props.appraisal.address}</h2>
            <br/>
            <br/>
            <FinancialTable rows={rows} />
            <br/>
            <h3 style={resultStyle}>Value by the Direct Comparison Approach... <CurrencyValue cents={false} center>{this.props.appraisal.stabilizedStatement.valuationRounded}</CurrencyValue></h3>
            </body>
            </html>
        )
    }
}


renderDocument((data) =>
{
    return <App
        appraisal={data.appraisal}
    />;
});

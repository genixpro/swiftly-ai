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
            "label": "Net Operating Income",
            "amount": <CurrencyValue cents={false}>{this.props.appraisal.stabilizedStatement.netOperatingIncome}</CurrencyValue>,
            "amountTotal": null,
            "mode": "title"
        });

        rows.push({
            "label": <span>
                Capitalized @ <PercentValue left>{this.props.appraisal.stabilizedStatementInputs.capitalizationRate}</PercentValue>
            </span>,
            "amount": <CurrencyValue cents={false}>{this.props.appraisal.stabilizedStatement.capitalization}</CurrencyValue>,
            "amountTotal": null,
            "mode": "data"
        });

        if (this.props.appraisal.stabilizedStatement.marketRentDifferential)
        {
            rows.push({
                "label": <span>
                Market Rent Differential, Discounted At @ <PercentValue left>{this.props.appraisal.stabilizedStatementInputs.marketRentDifferentialDiscountRate}</PercentValue>
            </span>,
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.stabilizedStatement.marketRentDifferential}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }

        if (this.props.appraisal.stabilizedStatement.freeRentDifferential)
        {
            rows.push({
                "label": "Free Rent Differential",
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.stabilizedStatement.freeRentDifferential}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }

        if (this.props.appraisal.stabilizedStatement.vacantUnitDifferential)
        {
            rows.push({
                "label": "Vacant Unit Differential",
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.stabilizedStatement.vacantUnitDifferential}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }

        if (this.props.appraisal.stabilizedStatement.amortizationDifferential)
        {
            rows.push({
                "label": "Amortization Differential",
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.stabilizedStatement.amortizationDifferential}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }

        this.props.appraisal.stabilizedStatementInputs.modifiers.forEach((modifier) =>
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
            "amountTotal": <CurrencyValue cents={false}>{this.props.appraisal.stabilizedStatement.valuation}</CurrencyValue>,
            "mode": "title"
        });

        rows.push({
            "label": "Rounded",
            "amount": null,
            "amountTotal": <CurrencyValue cents={false}>{this.props.appraisal.stabilizedStatement.valuationRounded}</CurrencyValue>,
            "mode": "data"
        });

        return (
            <html>
            <body>
            <br/>
            <h1 style={headerStyle}>Capitalization Valuation</h1>
            <h2 style={subHeaderStyle}>{this.props.appraisal.address}</h2>
            <br/>
            <br/>
            <FinancialTable rows={rows} />
            <br/>
            <h3 style={resultStyle}>Value by the Overall Capitalization Rate Method ... <CurrencyValue cents={false} center>{this.props.appraisal.stabilizedStatement.valuationRounded}</CurrencyValue></h3>
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

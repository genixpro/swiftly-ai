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

        const rows = [
            {
                "label": "Revenue",
                "amount": null,
                "amountTotal": null,
                "mode": "title"
            },
            {
                "label": "Stabilized Rental Income",
                "amount": <CurrencyValue cents={false}> {this.props.appraisal.stabilizedStatement.rentalIncome}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            },
            {
                "label": "Additional Income",
                "amount": <CurrencyValue cents={false}> {this.props.appraisal.stabilizedStatement.additionalIncome}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            },
            {
                "label": "Recoverable Income",
                "amount": <CurrencyValue cents={false}> {this.props.appraisal.stabilizedStatement.recoverableIncome}</CurrencyValue>,
                "amountTotal": null,
                "mode": "sumAfter"
            },
            {
                "label": "Potential Gross Income",
                "amount": <CurrencyValue cents={false}> {this.props.appraisal.stabilizedStatement.potentialGrossIncome}</CurrencyValue>,
                "amountTotal": null,
                "mode": "sum"
            },
            {
                "label": <span>
                            <span>Less Vacancy @ </span>
                            <PercentValue left>{this.props.appraisal.stabilizedStatementInputs.vacancyRate}</PercentValue>
                        </span>,
                "amount": <CurrencyValue cents={false}> {this.props.appraisal.stabilizedStatement.vacancyDeduction}</CurrencyValue>,
                "amountTotal": null,
                "mode": "sumAfter"
            },
            {
                "label": "Effective Gross Income",
                "amount": null,
                "amountTotal": <CurrencyValue cents={false}> {this.props.appraisal.stabilizedStatement.effectiveGrossIncome}</CurrencyValue>,
                "mode": "sum"
            },
            {
                "label": "Expenses",
                "amount": null,
                "amountTotal": null,
                "mode": "title"
            },
        ];

        if (this.props.appraisal.stabilizedStatement.operatingExpenses)
        {
            rows.push(
                {
                    "label": "Operating Expenses",
                    "amount": <CurrencyValue cents={false}> {this.props.appraisal.stabilizedStatement.operatingExpenses}</CurrencyValue>,
                    "amountTotal": null,
                    "mode": "data"
                }
            )
        }

        if (this.props.appraisal.stabilizedStatement.taxes)
        {
            rows.push(
                {
                    "label": "Taxes",
                    "amount": <CurrencyValue cents={false}> {this.props.appraisal.stabilizedStatement.taxes}</CurrencyValue>,
                    "amountTotal": null,
                    "mode": "data"
                }
            )
        }

        if (this.props.appraisal.stabilizedStatement.managementExpenses)
        {
            rows.push(
                {
                    "label": "Management Expenses",
                    "amount": <CurrencyValue cents={false}> {this.props.appraisal.stabilizedStatement.managementExpenses}</CurrencyValue>,
                    "amountTotal": null,
                    "mode": "data"
                }
            )
        }

        if (this.props.appraisal.stabilizedStatement.taxes)
        {
            rows.push(
                {
                    "label": "Management Expenses",
                    "amount": <CurrencyValue cents={false}> {this.props.appraisal.stabilizedStatement.managementExpenses}</CurrencyValue>,
                    "amountTotal": null,
                    "mode": "data"
                }
            )
        }

        if (this.props.appraisal.stabilizedStatement.tmiTotal)
        {
            rows.push(
                {
                    "label": <span>
                                    <span>TMI</span>
                                    <IntegerValue left>{this.props.appraisal.sizeOfBuilding}</IntegerValue> sqft @
                                    <CurrencyValue left>{this.props.appraisal.stabilizedStatementInputs.tmiRatePSF}</CurrencyValue>
                                </span>,
                    "amount": <CurrencyValue cents={false}> {this.props.appraisal.stabilizedStatement.tmiTotal}</CurrencyValue>,
                    "amountTotal": null,
                    "mode": "data"
                }
            )
        }


        rows.push({
            "label": <span>
                            <span>Structural Allowance @ </span>
                            <PercentValue left>{this.props.appraisal.stabilizedStatementInputs.structuralAllowancePercent}</PercentValue>
                        </span>,
            "amount": <CurrencyValue cents={false}> {this.props.appraisal.stabilizedStatement.structuralAllowance}</CurrencyValue>,
            "amountTotal": null,
            "mode": "sumAfter"
        });


        rows.push({
            "label": "Total Expenses",
            "amount": null,
            "amountTotal": <CurrencyValue cents={false}> {this.props.appraisal.stabilizedStatement.totalExpenses}</CurrencyValue>,
            "mode": "sumTotal"
        });


        rows.push({
            "label": "Net Operating Income",
            "amount": null,
            "amountTotal": <CurrencyValue cents={false}> {this.props.appraisal.stabilizedStatement.netOperatingIncome}</CurrencyValue>,
            "mode": "title"
        });


        return (
            <html>
            <body>
            <br/>
            <h1 style={headerStyle}>Stabilized Income & Expense Statement</h1>
            <h2 style={subHeaderStyle}>{this.props.appraisal.address}</h2>
            <br/>
            <br/>
            <FinancialTable rows={rows} />
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

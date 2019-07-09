import React from 'react'
import { renderToString } from 'react-dom/server'
import readJSONInput from "./read_json_input";
import fs from "fs";
import Moment from 'react-moment';
import _ from "underscore";
import NumberFormat from 'react-number-format';
import StyledTable from "./styled_table";
import {Value, CurrencyValue, PercentValue} from "./value";
import Spacer from "./spacer";
import renderDocument from "./render_doc";
import AppraisalModel from "../models/AppraisalModel";
import CurrencyFormat from "../pages/components/CurrencyFormat";
import IntegerFormat from "../pages/components/IntegerFormat";
import PercentFormat from "../pages/components/PercentFormat";

class App extends React.Component {

    computeGroup(itemType)
    {
        const headers = ["Expenses"];

        const columnSizes = ["25%"];

        const fields = {
            "name": (name) => <Value>{name}</Value>,
        };

        const expenses = _.filter(this.props.appraisal.incomeStatement.expenses, (expense) => expense.incomeStatementItemType === itemType || itemType === null);

        const yearTotals = {};

        this.props.appraisal.incomeStatement.years.forEach((year) =>
        {
            headers.push(year.toString());
            headers.push("PSF");
            fields["yearlyAmounts." + year.toString()] = (amount) => <CurrencyValue cents={false}>{amount}</CurrencyValue>;
            fields["yearlyAmountsPSF." + year.toString()] = (amount, obj) => <CurrencyValue cents={true}>{obj["yearlyAmounts." + year.toString()] / this.props.appraisal.sizeOfBuilding}</CurrencyValue>;
            columnSizes.push("15%");
            columnSizes.push("10%");

            yearTotals[year] = 0;

            this.props.appraisal.incomeStatement.expenses.forEach((expense) =>
            {
                if (_.isNumber(expense.yearlyAmounts[year]))
                {
                    yearTotals[year] += expense.yearlyAmounts[year]
                }
            });
        });

        const totals = [
            {
                "name": "Total Expenses",
                "yearlyAmounts": yearTotals
            }
        ];

        return {headers, fields, expenses, totals, columnSizes}
    }


    render()
    {
        const {headers, fields, expenses, totals, columnSizes} = this.computeGroup(null);

        let appraisalYear = this.props.appraisal.incomeStatement.latestYear;
        let lastYear = appraisalYear - 1;
        let twoYearsAgo = appraisalYear - 2;

        return (
            <html>
            <body style={{"width": "7in"}}>
            <br/>
            <h3>Realty Taxes and Operating Costs</h3>
            <br/>
            <h4>Recoverable Costs</h4>
            <p>
                According to the final {twoYearsAgo} Realty Tax Bill, realty taxes are <CurrencyFormat value={this.props.appraisal.incomeStatement.calculateTotalExpenses(twoYearsAgo, "taxes")}/>.
                &nbsp;According to the {lastYear} Budget, realty taxes were estimated to be <CurrencyFormat value={this.props.appraisal.incomeStatement.calculateTotalExpenses(lastYear, "taxes")}/>.
                &nbsp;We have increased the {lastYear} Budget figures by <PercentFormat value={100 * this.props.appraisal.incomeStatement.calculateTotalExpenses(appraisalYear, "taxes") / this.props.appraisal.incomeStatement.calculateTotalExpenses(lastYear, "taxes")}/> to estimate {appraisalYear} taxes.
            </p>
            <p>
                Operating costs cover the management of the building including items such as: insurance and property maintenance. A budget for {lastYear} has been provided. We have increased the 2018 Budget figures by <PercentFormat value={100 * this.props.appraisal.incomeStatement.calculateTotalExpenses(appraisalYear, "operating_expenses") / this.props.appraisal.incomeStatement.calculateTotalExpenses(lastYear, "operating_expenses")}/> to estimate operating costs in {appraisalYear}. Expenses are detailed below:
            </p>
            <p>
                *This section can be auto populated based on your company specific verbiage.
            </p>
            <StyledTable
                headers={headers}
                rows={expenses}
                fields={fields}
                totals={totals}
                columnSizes={columnSizes}
            />
            <br/>
            <p>
                Recoverable Operating Costs are estimated at <CurrencyFormat cents={false} value={this.props.appraisal.stabilizedStatement.operatingExpenses + this.props.appraisal.stabilizedStatement.managementExpenses + this.props.appraisal.stabilizedStatement.taxes}/>
                &nbsp;for {this.props.appraisal.incomeStatement.latestYear}. Taxes for {lastYear} are estimated at
                &nbsp;<CurrencyFormat cents={false} value={this.props.appraisal.incomeStatement.calculateTotalExpenses(lastYear, "taxes")}/>.
                The operating cost and expense figures are considered reasonable for the subject neighborhood, falling within the range presented by comparable leases.
            </p>
            <h4>Management Expense</h4>
            <p>
                According to leases a management fee of 15% of operating costs is recoverable from the tenants. We have offset this recovery with a management expense of
                &nbsp;<PercentFormat value={this.props.appraisal.stabilizedStatementInputs.managementExpenseCalculationRule.percent} /> of
                &nbsp;{this.props.appraisal.stabilizedStatementInputs.managementExpenseCalculationRule.field}.
            </p>
            </body>
            </html>
        )
    }
}

renderDocument((data) =>
{
    const appraisal = AppraisalModel.create(data.appraisal);

    return <App
        appraisal={appraisal}
    />;
});


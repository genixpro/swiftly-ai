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
import {nameForCalculationField} from "../pages/components/CalculationFieldSelector";

class App extends React.Component {

    computeRows()
    {
        const headers = ["Expenses"];

        const columnSizes = ["25%"];

        const fields = {
            "name": (name) => <Value>{name}</Value>,
        };

        const operatingExpenses = _.filter(this.props.appraisal.incomeStatement.expenses, (expense) => expense.incomeStatementItemType === "operating_expense");
        const managementExpenses = _.filter(this.props.appraisal.incomeStatement.expenses, (expense) => expense.incomeStatementItemType === "management_expense");
        const taxes = _.filter(this.props.appraisal.incomeStatement.expenses, (expense) => expense.incomeStatementItemType === "taxes");

        const yearTotals = {};

        const totalOperating = {
            "name": "Total Operating Expenses",
            "yearlyAmounts": {}
        };

        const totalTaxes = {
            "name": "Total Realty Taxes",
            "yearlyAmounts": {}
        };

        const totalManagement = {
            "name": "Total Management Expenses",
            "yearlyAmounts": {}
        };

        this.props.appraisal.incomeStatement.years.forEach((year) =>
        {
            totalOperating.yearlyAmounts[year.toString()] = _.reduce(operatingExpenses, function(memo, expense){ return memo + expense.yearlyAmounts[year]; }, 0);
            totalTaxes.yearlyAmounts[year.toString()] = _.reduce(taxes, function(memo, expense){ return memo + expense.yearlyAmounts[year]; }, 0);
            totalManagement.yearlyAmounts[year.toString()] = _.reduce(managementExpenses, function(memo, expense){ return memo + expense.yearlyAmounts[year]; }, 0);
        });

        const rows = operatingExpenses.concat([totalOperating, {yearlyAmounts: {}}]).concat(managementExpenses).concat([totalManagement, {yearlyAmounts: {}}]).concat(taxes).concat([totalTaxes]);

        this.props.appraisal.incomeStatement.years.forEach((year) =>
        {
            headers.push(year.toString() + "\n" + this.props.appraisal.incomeStatement.customYearTitles[year]);
            headers.push("PSF");
            fields["yearlyAmounts." + year.toString()] = (amount) => <CurrencyValue cents={false}>{amount}</CurrencyValue>;
            fields["yearlyAmountsPSF." + year.toString()] = (amount, obj) => <CurrencyValue cents={true}>{obj["yearlyAmounts"][year.toString()] ? obj["yearlyAmounts"][year.toString()] / this.props.appraisal.sizeOfBuilding : null}</CurrencyValue>;
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

        return {headers, fields, rows, totals, columnSizes}
    }


    render()
    {
        const {headers, fields, rows, totals, columnSizes} = this.computeRows();

        let appraisalYear = this.props.appraisal.incomeStatement.latestYear;
        let lastYear = appraisalYear - 1;
        let twoYearsAgo = appraisalYear - 2;

        let hasLastYear = this.props.appraisal.incomeStatement.years.indexOf(lastYear) !== -1;
        let hasTwoYearsAgo = this.props.appraisal.incomeStatement.years.indexOf(twoYearsAgo) !== -1;

        return (
            <html>
            <body style={{"width": "7in"}}>
            <br/>
            <h4 style={{"textAlign": "center"}}>REALTY TAXES AND OPERATING COSTS</h4>
            <br/>
            <h5>Recoverable Costs</h5>
            <p>
                {hasTwoYearsAgo ? <span>According to the final {twoYearsAgo} Realty Tax Bill, realty taxes are <CurrencyFormat value={this.props.appraisal.incomeStatement.calculateTotalExpenses(twoYearsAgo, "taxes")}/>.</span> : null}
                &nbsp;According to the {lastYear} Budget, realty taxes were estimated to be <CurrencyFormat value={this.props.appraisal.incomeStatement.calculateTotalExpenses(lastYear, "taxes")}/>.
                &nbsp;We have increased the {lastYear} Budget figures by <PercentFormat value={100 * (this.props.appraisal.incomeStatement.calculateTotalExpenses(appraisalYear, "taxes") / this.props.appraisal.incomeStatement.calculateTotalExpenses(lastYear, "taxes") - 1) }/> to estimate {appraisalYear} taxes.
            </p>
            <p>
                Operating costs cover the management of the building including items such as: insurance and property maintenance. A budget for {lastYear} has been provided. We have increased the 2018 Budget figures by <PercentFormat value={100 * this.props.appraisal.incomeStatement.calculateTotalExpenses(appraisalYear, "operating_expenses") / this.props.appraisal.incomeStatement.calculateTotalExpenses(lastYear, "operating_expenses")}/> to estimate operating costs in {appraisalYear}. Expenses are detailed below:
            </p>
            <p>
                *This section can be auto populated based on your company specific verbiage.
            </p>
            <StyledTable
                headers={headers}
                rows={rows}
                fields={fields}
                totals={totals}
                columnSizes={columnSizes}
            />
            <br/>
            <p>
                Recoverable Operating Costs are estimated at <CurrencyFormat cents={false} value={this.props.appraisal.stabilizedStatement.operatingExpenses + this.props.appraisal.stabilizedStatement.managementExpenses + this.props.appraisal.stabilizedStatement.taxes}/>
                &nbsp;for {this.props.appraisal.incomeStatement.latestYear}. Taxes for {lastYear} are estimated at
                &nbsp;<CurrencyFormat cents={false} value={this.props.appraisal.incomeStatement.calculateTotalExpenses(lastYear, "taxes")}/>.
                The operating cost and expense figures are considered reasonable for the subject neighborhood, falling within the range presented by properties.
            </p>

            {
                (this.props.appraisal.managementExpenseMode === 'rule' || this.props.appraisal.managementExpenseMode === 'combined_structural_rule') &&
                this.props.appraisal.stabilizedStatementInputs.managementExpenseCalculationRule.percent ?
                    <div>
                        <h4>Management Expense</h4>
                        <p>
                            According to leases a management fee of 15% of operating costs is recoverable from the tenants. We have offset this recovery with a management expense of
                            &nbsp;<PercentFormat value={this.props.appraisal.stabilizedStatementInputs.managementExpenseCalculationRule.percent} /> of
                            &nbsp;{nameForCalculationField(this.props.appraisal.stabilizedStatementInputs.managementExpenseCalculationRule.field)}.
                        </p>
                    </div> : null
            }
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


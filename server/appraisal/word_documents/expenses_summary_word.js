import React from 'react'
import { renderToString } from 'react-dom/server'
import readJSONInput from "./read_json_input";
import fs from "fs";
import Moment from 'react-moment';
import _ from "underscore";
import NumberFormat from 'react-number-format';
import CustomTable from "./custom_table";
import {Value, CurrencyValue, PercentValue} from "./value";
import Spacer from "./spacer";

class App extends React.Component {

    computeGroup(itemType)
    {
        const headers = [""];

        const fields = {
            "name": (name) => <Value>{name}</Value>,
        };

        const expenses = _.filter(this.props.appraisal.incomeStatement.expenses, (expense) => expense.incomeStatementItemType === itemType);

        const yearTotals = {};

        this.props.appraisal.incomeStatement.years.forEach((year) =>
        {
            headers.push(year.toString());
            fields["yearlyAmounts." + year.toString()] = (amount) => <CurrencyValue>{amount}</CurrencyValue>;

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
                "name": "Total Operating Expenses",
                "yearlyAmounts": yearTotals
            }
        ];

        return {headers, fields, expenses, totals}
    }


    render()
    {
        const {headers: operatingHeaders, fields: operatingExpenseFields, expenses: operatingExpenses, totals: operatingTotals} = this.computeGroup("operating_expense");
        const {headers: managementHeaders, fields: managementFields, expenses: managementExpenses, totals: managementTotals} = this.computeGroup("management_expense");
        const {headers: taxesHeaders, fields: taxFields, expenses: taxExpenses, totals: taxTotals} = this.computeGroup("management_expense");

        return (
            <html>
            <body>
            <br/>
            <h1>Expenses Summary</h1>
            <br/>
            <h2>Operating Expenses</h2>
            <br/>
            <CustomTable
                headers={operatingHeaders}
                rows={operatingExpenses}
                fields={operatingExpenseFields}
                totals={operatingTotals}
            />
            <br/>
            <h2>Management Expenses</h2>
            <br/>
            <CustomTable
                headers={managementHeaders}
                rows={managementExpenses}
                fields={managementFields}
                totals={managementTotals}
            />
            <br/>
            <h2>Taxes</h2>
            <br/>
            <CustomTable
                headers={taxesHeaders}
                rows={taxExpenses}
                fields={taxFields}
                totals={taxTotals}
            />
            </body>
            </html>
        )
    }
}

// Add something to the event loop. We just use a timeout with an absurdly long time
// Its quick and easy
const timeout = setTimeout(function() { }, 3600000);

(async () => {
    try
    {
        // Render the HTML
        const data = await readJSONInput();
        const html = renderToString(
            <App
                appraisal={data.appraisal}
            />
        );

        fs.writeFileSync(data.fileName, html);
        clearTimeout(timeout);
    }
    catch(err)
    {
        console.error(err);
        clearTimeout(timeout);
    }
})();


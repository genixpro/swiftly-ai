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

class App extends React.Component {

    computeGroup(itemType)
    {
        const headers = [""];

        const fields = {
            "name": (name) => <Value>{name}</Value>,
        };

        const incomes = _.filter(this.props.appraisal.incomeStatement.incomes, (income) => income.incomeStatementItemType === itemType);

        const yearTotals = {};

        this.props.appraisal.incomeStatement.years.forEach((year) =>
        {
            headers.push(year.toString());
            fields["yearlyAmounts." + year.toString()] = (amount) => <CurrencyValue>{amount}</CurrencyValue>;

            yearTotals[year] = 0;

            this.props.appraisal.incomeStatement.incomes.forEach((income) =>
            {
                if (_.isNumber(income.yearlyAmounts[year]))
                {
                    yearTotals[year] += income.yearlyAmounts[year]
                }
            });
        });

        const totals = [
            {
                "name": "Total Additional Income",
                "yearlyAmounts": yearTotals
            }
        ];

        return {headers, fields, incomes, totals}
    }


    render()
    {
        const {headers, fields, incomes, totals} = this.computeGroup("additional_income");

        return (
            <html>
            <body style={{"width": "7in"}}>
            <br/>
            <h1>Additional Income Summary</h1>
            <br/>
            <StyledTable
                headers={headers}
                rows={incomes}
                fields={fields}
                totals={totals}
            />
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


import React from 'react'
import { renderToString } from 'react-dom/server'
import readJSONInput from "./read_json_input";
import fs from "fs";
import Moment from 'react-moment';
import _ from "underscore";
import NumberFormat from 'react-number-format';
import StyledTable from "./styled_table";
import {Value, CurrencyValue, PercentValue, IntegerValue} from "./value";
import Spacer from "./spacer";
import renderDocument from "./render_doc";
import AppraisalModel from "../models/AppraisalModel";
import IntegerFormat from "../pages/components/IntegerFormat";

class App extends React.Component
{
    numberOfOccupiedUnits()
    {
        let count = 0;
        for(let unit of this.props.appraisal.units)
        {
            if (!unit.isVacantForStabilizedStatement)
            {
                count += 1;
            }
        }
        return count;
    }

    render()
    {

        return (
            <html>
            <body style={{"width": "7in"}}>
            <br/>
            <h1>Tenancy</h1>
            <p>
                The subject has a total of <IntegerValue>{this.props.appraisal.sizeOfBuilding}</IntegerValue> square feet. As of the effective date, the build was
                100% leased and occupied by <IntegerValue>{this.numberOfOccupiedUnits()}</IntegerValue> units
            </p>
            <br/>
            <p>
                Operating costs cover the management of the building including items such as: insurance and property maintenance. A budget for 2018 has been provided. We have increased the 2018 Budget figures by 2.25% to estimate operating costs in 2019. Expenses are detailed below:
            </p>
            <br/>
            <h2>Operating Expenses</h2>
            <br/>
            <StyledTable
                headers={operatingHeaders}
                rows={operatingExpenses}
                fields={operatingExpenseFields}
                totals={operatingTotals}
            />
            {/*<br/>*/}
            {/*<h2>Management Expenses</h2>*/}
            {/*<br/>*/}
            {/*<StyledTable*/}
            {/*    headers={managementHeaders}*/}
            {/*    rows={managementExpenses}*/}
            {/*    fields={managementFields}*/}
            {/*    totals={managementTotals}*/}
            {/*/>*/}
            {/*<br/>*/}
            {/*<h2>Taxes</h2>*/}
            {/*<br/>*/}
            {/*<StyledTable*/}
            {/*    headers={taxesHeaders}*/}
            {/*    rows={taxExpenses}*/}
            {/*    fields={taxFields}*/}
            {/*    totals={taxTotals}*/}
            {/*/>*/}
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


import React from 'react'
import { renderToString } from 'react-dom/server'
import readJSONInput from "./read_json_input";
import fs from "fs";
import Moment from 'react-moment';
import _ from "underscore";
import NumberFormat from 'react-number-format';
import CustomTable from "./styled_table";
import {Value, CurrencyValue, PercentValue, IntegerValue} from "./value";
import Spacer from "./spacer";
import renderDocument from "./render_doc";

class App extends React.Component {

    render()
    {
        const headers = ["Name", "Amount", "Interest", "Discount Rate", "Start Date", "Period (months)"];

        const fields = {
            "name": (name) => <Value>{name}</Value>,
            "amount": (amount) => <CurrencyValue>{amount}</CurrencyValue>,
            "interest": (interest) => <PercentValue>{interest}</PercentValue>,
            "discountRate": (discountRate) => <PercentValue>{discountRate}</PercentValue>,
            "startDate.$date": (startDate) => <Value>{startDate ? <Moment format="MMMM YYYY">{startDate}</Moment> : ""}</Value>,
            "periodMonths": (periodMonths) => <IntegerValue>{periodMonths}</IntegerValue>,
        };

        const totals = [];

        return (
            <html>
            <body style={{"width": "7in"}}>
            <br/>
            <h1>Amortization Schedule</h1>
            <br/>
            <CustomTable
                headers={headers}
                rows={this.props.appraisal.amortizationSchedule.items}
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


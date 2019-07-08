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
      return (
          <html>
            <body style={{"width": "7in"}}>
                <br/>
                <h1>Rent Roll</h1>
                <br/>
                <br/>
                <CustomTable
                    headers={["Unit", "Size (sqft)", "Tenant", "Rent", "Remarks"]}
                    rows={this.props.appraisal.units}
                    fields={{
                        "unitNumber": (unit) => <IntegerValue>{unit}</IntegerValue>,
                        "squareFootage": (squareFootage) => <IntegerValue>{squareFootage}</IntegerValue>,
                        "currentTenancy.name": (tenantName) => <Value>{tenantName}</Value>,
                        "currentTenancy.yearlyRent": (yearlyRent) => <CurrencyValue>{yearlyRent}</CurrencyValue>,
                        "remarks": (remarks) => <Value>{remarks}</Value>
                    }} />
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

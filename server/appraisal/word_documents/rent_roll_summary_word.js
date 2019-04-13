import React from 'react'
import { renderToString } from 'react-dom/server'
import readJSONInput from "./read_json_input";
import fs from "fs";
import Moment from 'react-moment';
import _ from "underscore";
import NumberFormat from 'react-number-format';
import CustomTable from "./custom_table";
import {Value, CurrencyValue, PercentValue, IntegerValue} from "./value";
import Spacer from "./spacer";

class App extends React.Component {
  render()
  {
      return (
          <html>
            <body>
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


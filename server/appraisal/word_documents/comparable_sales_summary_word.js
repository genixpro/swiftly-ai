import React from 'react'
import { renderToString } from 'react-dom/server'
import readJSONInput from "./read_json_input";
import fs from "fs";
import Moment from 'react-moment';
import _ from "underscore";
import NumberFormat from 'react-number-format';
import CustomTable from "./styled_table";
import {Value, CurrencyValue, PercentValue} from "./value";
import Spacer from "./spacer";
import renderDocument from "./render_doc";

class App extends React.Component {
  render()
  {
      return (
          <html>
            <body>
                <br/>
                <h1>Comparable Sales</h1>
                <br/>
                <br/>
                <CustomTable
                    headers={["Date", "Address", "Consideration", "Description", "Cap Rate"]}
                    rows={this.props.comparableSales}
                    fields={{
                        "saleDate.$date": (saleDate) => <Value><Moment format="MMMM YYYY">{saleDate}</Moment></Value>,
                        "address": (address) => <Value>{address}</Value>,
                        "salePrice": (salePrice) => <CurrencyValue>{salePrice}</CurrencyValue>,
                        "description": (description) => <Value>{description}</Value>,
                        "capitalizationRate": (capitalizationRate) => <PercentValue>{capitalizationRate}</PercentValue>
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
        comparableSales={data.comparableSales}
    />;
});
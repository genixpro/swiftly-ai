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
    render()
    {

        return (
            <html>
            <body style={{"width": "7in"}}>
            <br/>
            <h1>Tenancy</h1>
            <p>
                The subject has a total rentable area of <IntegerFormat value={this.props.appraisal.sizeOfBuilding} /> square feet. As of the effective date, the building was
                100% leased and occupied by <IntegerFormat value={this.props.appraisal.numberOfOccupiedUnits()} /> tenants.
            </p>
            <ul>
                {
                    this.props.appraisal.units.map((unit, unitIndex) =>
                        {
                            if (unit.isVacantForStabilizedStatement)
                            {
                                return null;
                            }
                            
                            return <li key={unitIndex}><p>Tenant {unitIndex + 1}: {unit.computedDescription}</p></li>
                        })
                }
            </ul>
            <p>*This section can be auto populated based on your company specific verbiage.</p>
            <br/>
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


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

        let tenantIndex = 0;
        return (
            <html>
            <body style={{"width": "7in"}}>
            <br/>
            <h4 style={{"textAlign": "center", "color": "black"}}>TENANCY</h4>
            <p>
                The subject has a total rentable area of <IntegerFormat value={this.props.appraisal.sizeOfBuilding} /> square feet. At the time of the appraisal,
                the building was 100% leased to <IntegerFormat value={this.props.appraisal.numberOfOccupiedUnits()} /> tenants.
            </p>
            <div>
                {
                    this.props.appraisal.units.map((unit, unitIndex) =>
                        {
                            if (unit.isVacantForStabilizedStatement)
                            {
                                return null;
                            }

                            tenantIndex += 1;

                            return <p key={unitIndex}>{unit.currentTenancy.name}: {unit.computedDescription}</p>
                        })
                }
            </div>
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


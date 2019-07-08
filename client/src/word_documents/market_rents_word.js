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
import AppraisalModel from "../models/AppraisalModel";
import IntegerFormat from "../pages/components/IntegerFormat";
import AreaFormat from "../pages/components/AreaFormat";
import ComparableLeaseModel from "../models/ComparableLeaseModel";

class MarketRentsWord extends React.Component
{
    render()
    {

        return (
            <html>
            <body style={{"width": "7in"}}>
            <br/>
            <h3>Market Rents</h3>
            <p>To determine the long-term income potential of the subject property the market rent for the property must
                be estimated. Estabspanshing market rent also contextuaspanzes current contract rent within the building as
                compared to the prevaispanng market levels. In estabspanshing the market rent the following analysis has been
                completed:</p>
            <ul>
                <span>Analyzed the most recent lease deals from within the subject building;</span>
                <span>Researched, and analyzed, recent leases and current asking rates involving comparable industrial buildings
                    located throughout the {this.props.appraisal.address} and surrounding areas.</span>
            </ul>

            <CustomTable
                headers={["Index \n Date", "Address", "Size", "Rent", "Remarks"]}
                rows={this.props.comparableLeases}
                fields={{
                    "leaseDate": (leaseDate, obj, objIndex) => <Value><p>L{objIndex + 1}</p><br/><Moment format="YYYY">{leaseDate}</Moment></Value>,
                    "address": (address) => <Value>{address}</Value>,
                    "sizeOfUnit": (sizeOfUnit) => <AreaFormat value={sizeOfUnit} />,
                    "rentEscalations": (rentEscalations, obj) => <span>{rentEscalations ? rentEscalations.map((escalation) =>
                        <span>
                            Yrs {escalation.startYear}-{escalation.endYear} @ <CurrencyValue cents={false}>{escalation.yearlyRent}</CurrencyValue>
                        </span>
                    ) : null}
                    {
                        obj.rentType === 'gross' ? <span>gross</span> : null
                    }
                    </span>,
                    "remarks": (remarks, obj) => <p>
                        <span>{remarks}</span>
                        {
                            obj.finishedOfficePercentage ?
                                <span><PercentValue>{obj.finishedOfficePercentage}</PercentValue> finished office percentage</span> : null
                        }
                        {
                            obj.shippingDoorsDoubleMan || obj.shippingDoorsTruckLevel || obj.shippingDoorsDriveIn ?
                                <span>
                                    {
                                        obj.shippingDoorsDoubleMan ? <span><IntegerFormat value={obj.shippingDoorsDoubleMan}/> D/M </span> : null
                                    }
                                    {
                                        obj.shippingDoorsTruckLevel ? <span><IntegerFormat value={obj.shippingDoorsTruckLevel}/> T/L </span> : null
                                    }
                                    {
                                        obj.shippingDoorsDriveIn ? <span><IntegerFormat value={obj.shippingDoorsDriveIn}/> D/I </span> : null
                                    }
                                </span> : null
                        }
                        {
                            obj.tenantName ?
                                <span>Lease to {obj.tenantName}</span>
                                : null
                        }
                        {
                            obj.taxesMaintenanceInsurance ?
                                <span>TMI @ <CurrencyValue cents={true}>{obj.taxesMaintenanceInsurance}</CurrencyValue></span>
                                : null
                        }
                        {
                            obj.tenantInducementsPSF ?
                                <span>TI @ <CurrencyValue cents={true}>{obj.tenantInducementsPSF}</CurrencyValue></span>
                                : null
                        }
                        {
                            obj.freeRentMonths ?
                                <span>Free Rent <IntegerValue>{obj.freeRentMonths}</IntegerValue></span>
                                : null
                        }
                    </p>
                }} />




            <p>
                {/*The subject has a total of <IntegerValue>{this.props.appraisal.sizeOfBuilding}</IntegerValue> square feet. As of the effective date, the build was*/}
                {/*100% leased and occupied by <IntegerValue>{this.numberOfOccupiedUnits()}</IntegerValue> units*/}
            </p>
            {/*<br/>*/}
            {/*<h2>Management Expenses</h2>*/}
            {/*<br/>*/}
            {/*<br/>*/}
            {/*<h2>Taxes</h2>*/}
            {/*<br/>*/}
            {/*<CustomTable*/}
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

    return <MarketRentsWord
        appraisal={appraisal}
        comparableLeases={data.comparableLeases.map((comp) => ComparableLeaseModel.create(comp))}
    />;
});


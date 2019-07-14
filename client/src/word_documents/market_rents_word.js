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
import AreaFormat from "../pages/components/AreaFormat";
import ComparableLeaseModel from "../models/ComparableLeaseModel";
import CurrencyFormat from "../pages/components/CurrencyFormat";

class MarketRentsWord extends React.Component
{
    cleanNumericalValue(value)
    {
        value = value.toString();
        const cleanText = value.replace(/[^0-9.]/g, "");
        const isNegative = value.indexOf("-") !== -1 || value.indexOf("(") !== -1 || value.indexOf(")") !== -1;

        if (cleanText === "")
        {
            return 0;
        }

        try {
            if (isNegative)
            {
                return -Number(cleanText);
            }
            else
            {
                return Number(cleanText);
            }
        }
        catch(err) {
            return 0;
        }
    }

    getCity(address)
    {
        const words = address.split(",");
        return words[words.length - 3];
    }

    render()
    {
        let minRent = null;
        let maxRent = null;

        let minTI = null;
        let maxTI = null;

        let minYears = null;
        let maxYears = null;

        let countWithEscalations = 0;

        let allNet = true;
        let allGross = true;

        this.props.comparableLeases.forEach((lease) =>
        {
            if (lease.rentType === 'gross')
            {
                allNet = false;
            }
            else if (lease.rentType === 'net')
            {
                allGross = false;
            }

            lease.rentEscalations.forEach((escalation) =>
            {
                if (minRent === null || escalation.yearlyRent < minRent)
                {
                    minRent = escalation.yearlyRent;
                }

                if (maxRent === null || escalation.yearlyRent > maxRent)
                {
                    maxRent = escalation.yearlyRent;
                }
            });

            if (lease.rentEscalations.length)
            {
                const numYears = lease.rentEscalations[lease.rentEscalations.length - 1].endYear;

                if (minYears === null || numYears < minYears)
                {
                    minYears = numYears;
                }

                if (maxYears === null || numYears > maxYears)
                {
                    maxYears = numYears;
                }
            }

            if (lease.rentEscalations.length > 1)
            {
                countWithEscalations += 1;
            }

            if (lease.tenantInducements && this.cleanNumericalValue(lease.tenantInducements))
            {
                if (minTI === null || this.cleanNumericalValue(lease.tenantInducements) < minTI)
                {
                    minTI = this.cleanNumericalValue(lease.tenantInducements);
                }

                if (maxTI === null || this.cleanNumericalValue(lease.tenantInducements) > maxTI)
                {
                    maxTI = this.cleanNumericalValue(lease.tenantInducements);
                }
            }
        });

        const ratioOfEscalations = this.props.comparableLeases.length ? countWithEscalations / this.props.comparableLeases.length : 1;

        const marketRents = {};
        for (let unit of this.props.appraisal.units)
        {
            if (unit.marketRentAmount)
            {
                if (!marketRents[unit.marketRentAmount])
                {
                    marketRents[unit.marketRentAmount] = 1;
                }
                else
                {
                    marketRents[unit.marketRentAmount] += 1;
                }
            }
        }

        return (
            <html>
            <body style={{"width": "7in"}}>
            <br/>
            <h4 style={{"textAlign": "center", "color": "black"}}>MARKET RENTS</h4>
            <p>To determine the long-term income potential of the subject property the market rent for the
                property must be established. Estimating market rent also allows the appraiser to analyze
                current contract rent within the building as compared to the market levels. In establishing the
                market rent the following analysis has been completed: Analyzed the lease deals from the subject
                building and analyzed recent completed leases involving similar ${this.props.appraisal.propertyType}
                buildings located throughout {this.getCity(this.props.appraisal.address)} and surrounding areas.</p>

            <StyledTable
                headers={["Index \n Date", "Address", "Size", "Rent", "Remarks"]}
                rows={this.props.comparableLeases}
                fontSize={10}
                columnSizes={[
                    "10%",
                    "40%",
                    "10%",
                    "15%",
                    "25%"
                ]}
                fields={{
                    "leaseDate": (leaseDate, obj, objIndex) => <Value><span>L{objIndex + 1}</span><br/><Moment format="M/YY">{obj.leaseDate}</Moment></Value>,
                    "address": (address) => <Value>{address}</Value>,
                    "sizeOfUnit": (sizeOfUnit) => <AreaFormat value={sizeOfUnit} />,
                    "rentEscalations": (rentEscalations, obj) => <span>{
                        obj.rentEscalations.length ? obj.rentEscalations.map((escalation, escalationIndex) =>
                            <span key={escalationIndex}>
                                Yrs {escalation.startYear}-{escalation.endYear} @ <CurrencyFormat value={escalation.yearlyRent} />
                                <br/>
                            </span>
                        ): null}
                        {
                            obj.rentType === 'gross' ? <span>gross</span> : null
                        }
                    </span>,
                    "remarks": (remarks, obj) => <span>
                        {
                            remarks ?
                                <span>{remarks}<br/></span>
                                : null
                        }
                        {
                            obj.finishedOfficePercentage ?
                                <span><PercentValue>{obj.finishedOfficePercentage}</PercentValue> finished office percentage<br/></span> : null
                        }
                        {
                            obj.shippingDoorsDoubleMan || obj.shippingDoorsTruckLevel || obj.shippingDoorsDriveIn ?
                                <span>
                                    {
                                        obj.shippingDoorsDoubleMan ? <span><IntegerFormat value={obj.shippingDoorsDoubleMan}/> D/M <br/></span> : null
                                    }
                                    {
                                        obj.shippingDoorsTruckLevel ? <span><IntegerFormat value={obj.shippingDoorsTruckLevel}/> T/L <br/></span> : null
                                    }
                                    {
                                        obj.shippingDoorsDriveIn ? <span><IntegerFormat value={obj.shippingDoorsDriveIn}/> D/I <br/></span> : null
                                    }
                                </span> : null
                        }
                        {
                            obj.name ?
                                <span>Lease to {obj.name}<br/></span>
                                : null
                        }
                        {
                            obj.taxesMaintenanceInsurance ?
                                <span>TMI @ <CurrencyFormat value={obj.taxesMaintenanceInsurance} /><br/></span>
                                : null
                        }
                        {
                            obj.tenantInducements ?
                                <span>TI @ <CurrencyFormat value={obj.tenantInducements} /><br/></span>
                                : null
                        }
                        {
                            obj.freeRentMonths ?
                                <span>Free Rent <IntegerFormat value={obj.freeRentMonths} /><br/></span>
                                : null
                        }
                    </span>
                }} />
            <br />

            <p>
                <span>
                    The comparable lease data detailed above shows rents in the range from <CurrencyFormat value={minRent} /> to <CurrencyFormat value={maxRent} /> per
                    square foot (net) for {this.props.appraisal.propertyType} space located in {this.getCity(this.props.appraisal.address)} and surrounding areas. The rental
                    range is in terms of the first-year net rental figures of leases that range in length from <IntegerFormat value={minYears} /> to <IntegerFormat value={maxYears} /> years.
                </span>
                <span>
                    {
                        allNet ? <span>The leases are net</span> : null
                    }
                    {
                        allGross ? <span>The leases are gross</span> : null
                    }
                    {
                        !allNet && !allGross ? <span>The leases are a mixture of net and gross</span> : null
                    }
                    {
                        minTI || maxTI ?
                            <span> and included tenant inducements ranging from <CurrencyFormat value={minTI} /> to <CurrencyFormat value={maxTI} /></span> :
                            <span> and did not include any significant tenant inducements or allowances.</span>
                    }
                </span>
                <span>
                    The rates at the upper end of the range refer to modern buildings that offer a superior level of accommodation in terms of age, clear ceiling height, features, and finished office space.
                </span>
                <span>
                    Rates at the low end of the range are generally indicated in older buildings with an inferior level of accommodation.
                </span>
            </p>
            <h3>Summary of Market Rents</h3>
            <ul>
                <li>
                    The comparable lease deals indicate a range from <CurrencyFormat value={minRent} /> to over <CurrencyFormat value={maxRent} /> per square foot
                    {
                        allNet ? <span> (net)</span> : null
                    }
                    {
                        allGross ? <span> (gross)</span> : null
                    }
                    {
                        !allNet && !allGross ? <span>, and are a mixture of net and gross leases.</span> : null
                    }
                </li>
                <li>
                    {
                        ratioOfEscalations > 0.5 ?
                            <span>Most of the comparable leases deals included rent escalations over the term.</span>
                            : <span>Most of the comparable leases did not have escalations over the term.</span>
                    }
                </li>
                {
                    Object.keys(marketRents).length === 0 ? <li>
                        <span>We deemed all of the units to to be at the market rate.</span>
                    </li> : null
                }
                {
                    Object.keys(marketRents).forEach((marketRentAmount) =>
                    {
                        let unitCountString = "";
                        if (Object.keys(marketRents).length > 2)
                        {
                            unitCountString += ` for ${Object.keys(marketRents).length} units`;
                        }

                        return <li>A rate of <CurrencyFormat value={marketRentAmount} /> per square foot is considered appropriate {unitCountString}, as an average rate over a five-year lease term, and paired with a tenant inducement, detailed in this report.</li>
                    })
                }
            </ul>
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


import React from 'react'
import {Value, CurrencyValue, PercentValue, IntegerValue} from "./value";
import DirectComparisonTable from "./direct_comparison_table";
import renderDocument from "./render_doc";
import ComparableSalesTable from "./comparable_sales_table";
import _ from 'underscore';
import ComparableSaleModel from "../models/ComparableSaleModel";
import AppraisalModel from "../models/AppraisalModel";
import CurrencyFormat from "../pages/components/CurrencyFormat";
import StyledTable from "./styled_table";
import Moment from "react-moment";
import AreaFormat from "../pages/components/AreaFormat";
import IntegerFormat from "../pages/components/IntegerFormat";

class App extends React.Component
{
    render()
    {
        const headerStyle = {
            "textAlign": "center"
        };

        const subHeaderStyle = {
            "textAlign": "center"
        };

        const resultStyle = {
            "textAlign": "center",
            "fontStyle": "italic",
            "fontFamily": "monospace, serif",
            "fontSize": "14px",
            "letterSpacing": "-1px"
        };

        let minPricePerSquareFoot = _.min(_.filter(this.props.comparableSales, (comp) => comp.pricePerSquareFoot), (comp) => comp.pricePerSquareFoot).pricePerSquareFoot;
        let maxPricePerSquareFoot = _.max(_.filter(this.props.comparableSales, (comp) => comp.pricePerSquareFoot), (comp) => comp.pricePerSquareFoot).pricePerSquareFoot;

        let noiMultipleCount = 0;
        let noiMultipleTotal = 0;

        this.props.comparableSales.forEach((comp) =>
        {
            if (comp.noiPSFMultiple)
            {
                noiMultipleCount += 1;
                noiMultipleTotal += comp.noiPSFMultiple;
            }
        });

        if (!_.isFinite(minPricePerSquareFoot) || _.isUndefined(minPricePerSquareFoot))
        {
            minPricePerSquareFoot = 0;
        }

        if (!_.isFinite(maxPricePerSquareFoot) || _.isUndefined(maxPricePerSquareFoot))
        {
            maxPricePerSquareFoot = 0;
        }

        return (
            <html>
            <body style={{"width": "7in"}}>
            <br/>
            <h4 style={{"textAlign": "center", "color": "#2f5496"}}>DIRECT COMPARISON APPROACH</h4>
            {/*<h2 style={subHeaderStyle}>{this.props.appraisal.address}</h2>*/}
            <p>The Direct Comparison Approach: This section will be auto populated based on your company specific verbiage.</p>
            <br/>
            <StyledTable
                headers={["Date", "Address", "Consideration", "Building Size (sf)", "Cap Rate"]}
                rows={this.props.comparableSales}
                fontSize={10}
                fields={{
                    "saleDate": (saleDate, obj) => <span style={{"textAlign": "center"}}><Moment format="M/YY">{obj.saleDate}</Moment></span>,
                    "address": (address) => <Value>{address}</Value>,
                    "salePrice": (salePrice) => <CurrencyValue center>{salePrice}</CurrencyValue>,
                    "sizeSquareFootage": (sizeSquareFootage) => <span style={{"textAlign": "center"}}><IntegerFormat value={sizeSquareFootage} /></span>,
                    "capitalizationRate": (capitalizationRate) => <PercentValue center>{capitalizationRate}</PercentValue>
                }}
                columnSizes={[
                    "10%",
                    "45%",
                    "15%",
                    "15%",
                    "15%"
                ]}
            />

            <br/>

            <p>
                The sales identified above indicate a range in values from approximately <CurrencyFormat value={minPricePerSquareFoot} /> to upwards of <CurrencyFormat value={maxPricePerSquareFoot} /> per square foot.
                The range reflects differences in the comparable properties such as: location, quality of finishing’s, average net rent.
            </p>

            <h4 style={{"textAlign": "left", "color": "#2f5496"}}>LAND</h4>
            <ul><li>This section will be auto populated based on your company specific verbiage.</li></ul>
            <h4 style={{"textAlign": "left", "color": "#2f5496"}}>FINANCING</h4>
            <ul><li>This section will be auto populated based on your company specific verbiage.</li></ul>
            <h4 style={{"textAlign": "left", "color": "#2f5496"}}>COMPARABLE BUILDING SALE CONDITIONS</h4>
            <ul><li>This section will be auto populated based on your company specific verbiage.</li></ul>
            <h4 style={{"textAlign": "left", "color": "#2f5496"}}>NOI PSF / MULTIPLE CALCULATOR</h4>
            <ul><li>This section will be auto populated based on your company specific verbiage.</li></ul>

            <StyledTable
                headers={["Index", "Price PSF", "NOI PSF", "Multiple"]}
                fontSize={10}
                rows={this.props.comparableSales}
                fields={{
                    "index": (field, obj, index) => <Value>{index}</Value>,
                    "pricePerSquareFoot": (pricePerSquareFoot) => <span style={{"textAlign": "center"}}><CurrencyFormat value={pricePerSquareFoot}/></span>,
                    "netOperatingIncomePSF": (netOperatingIncomePSF) => <span style={{"textAlign": "center"}}><CurrencyFormat value={netOperatingIncomePSF}/></span>,
                    "noiPSFMultiple": (noiPSFMultiple, obj) => <span style={{"textAlign": "center"}}>{obj.noiPSFMultiple ? obj.noiPSFMultiple.toFixed(2) : ""}</span>,
                }} />

            <br/>
            <ul>
                {
                    noiMultipleCount ?
                        <li>The average multiple of the comparable properties is {(noiMultipleTotal / noiMultipleCount).toFixed(2)}.
                            A rate of {this.props.appraisal.directComparisonInputs.noiPSFMultiple.toFixed(1)} is reasonable for the subject.
                            The subjects NOI was multiplied by {this.props.appraisal.directComparisonInputs.noiPSFMultiple.toFixed(1)} for a PSF
                            estimate of <CurrencyFormat value={this.props.appraisal.directComparisonInputs.noiPSFPricePerSquareFoot} />
                        </li>
                        : null
                }
            </ul>
            <br/>
            <DirectComparisonTable appraisal={this.props.appraisal} />
            <br/>

            <h3 style={resultStyle}>Final Value by the DCA <br/> <CurrencyFormat cents={false} center value={this.props.appraisal.stabilizedStatement.valuationRounded}/></h3>
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
        comparableSales={data.comparableSales.map((comp) => ComparableSaleModel.create(comp))}
    />;
});

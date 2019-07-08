import React from 'react'
import {Value, CurrencyValue, PercentValue, IntegerValue} from "./value";
import DirectComparisonTable from "./direct_comparison_table";
import renderDocument from "./render_doc";
import ComparableSalesTable from "./comparable_sales_table";
import _ from 'underscore';
import ComparableSaleModel from "../models/ComparableSaleModel";
import AppraisalModel from "../models/AppraisalModel";

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
            <h1 style={headerStyle}>Direct Comparison Approach</h1>
            {/*<h2 style={subHeaderStyle}>{this.props.appraisal.address}</h2>*/}
            <p>The Direct Comparison Approach: This section will be auto populated based on your company specific verbiage.</p>
            <br/>
            <br/>
            <ComparableSalesTable comparableSales={this.props.comparableSales} />
            <br/>

            <p>
                The sales identified above indicate a range in values from approximately <CurrencyValue>{minPricePerSquareFoot}</CurrencyValue> to upwards of <CurrencyValue>{maxPricePerSquareFoot}</CurrencyValue> per square foot.
                The range reflects differences in the comparable properties such as: location, quality of finishing’s, average net
                rent.
            </p>
            <DirectComparisonTable appraisal={this.props.appraisal} />
            <br/>
            <h3 style={resultStyle}>Value by the Direct Comparison Approach... <CurrencyValue cents={false} center>{this.props.appraisal.stabilizedStatement.valuationRounded}</CurrencyValue></h3>
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

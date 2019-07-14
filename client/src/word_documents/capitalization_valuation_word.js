import React from 'react'
import {renderToString} from 'react-dom/server'
import readJSONInput from "./read_json_input";
import fs from "fs";
import Moment from 'react-moment';
import _ from "underscore";
import NumberFormat from 'react-number-format';
import StyledTable from "./styled_table";
import {Value, CurrencyValue, PercentValue, IntegerValue} from "./value";
import Spacer from "./spacer";
import FinancialTable from "./financial_table";
import renderDocument from "./render_doc";
import AppraisalModel from "../models/AppraisalModel";
import ComparableSaleModel from "../models/ComparableSaleModel";
import AreaFormat from "../pages/components/AreaFormat";
import CurrencyFormat from "../pages/components/CurrencyFormat";
import IntegerFormat from "../pages/components/IntegerFormat";
import PercentFormat from "../pages/components/PercentFormat";
import {jStat} from "jStat";
import ComparableSalesSummaries from "./comparable_sales_summaries";

class App extends React.Component
{
    render()
    {
        const subHeaderStyle = {
            "textAlign": "center"
        };

        const resultStyle = {
            "textAlign": "center",
            "fontFamily": "monospace, serif",
            "fontSize": "14px",
            "letterSpacing": "-1px"
        };

        const rows = [];


        rows.push({
            "label": "Net Operating Income",
            "amount": <CurrencyValue cents={false}>{this.props.appraisal.stabilizedStatement.netOperatingIncome}</CurrencyValue>,
            "amountTotal": null,
            "mode": "title"
        });

        rows.push({
            "label": <span>
                Capitalized @ <PercentValue left>{this.props.appraisal.stabilizedStatementInputs.capitalizationRate}</PercentValue>
            </span>,
            "amount": <CurrencyValue cents={false}>{this.props.appraisal.stabilizedStatement.capitalization}</CurrencyValue>,
            "amountTotal": null,
            "mode": "data"
        });

        if (this.props.appraisal.stabilizedStatement.marketRentDifferential && this.props.appraisal.stabilizedStatementInputs.applyMarketRentDifferential)
        {
            rows.push({
                "label": <span>Market Rent Differential</span>,
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.stabilizedStatement.marketRentDifferential}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }

        if (this.props.appraisal.stabilizedStatement.freeRentRentLoss && this.props.appraisal.stabilizedStatementInputs.applyFreeRentLoss)
        {
            rows.push({
                "label": "Remaining Free Rent",
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.stabilizedStatement.freeRentRentLoss}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }

        if (this.props.appraisal.stabilizedStatement.vacantUnitRentLoss && this.props.appraisal.stabilizedStatementInputs.applyVacantUnitRentLoss)
        {
            rows.push({
                "label": "Vacant Unit Rent Loss",
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.stabilizedStatement.vacantUnitRentLoss}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }

        if (this.props.appraisal.stabilizedStatement.vacantUnitLeasupCosts && this.props.appraisal.stabilizedStatementInputs.applyVacantUnitLeasingCosts)
        {
            rows.push({
                "label": "Vacant Unit Leasing Costs",
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.stabilizedStatement.vacantUnitLeasupCosts}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }

        if (this.props.appraisal.stabilizedStatement.amortizedCapitalInvestment && this.props.appraisal.stabilizedStatementInputs.applyAmortization)
        {
            rows.push({
                "label": "Amortized Capital Investment",
                "amount": <CurrencyValue cents={false}>{this.props.appraisal.stabilizedStatement.amortizedCapitalInvestment}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        }

        this.props.appraisal.stabilizedStatementInputs.modifiers.forEach((modifier) =>
        {
            rows.push({
                "label": modifier.name,
                "amount": <CurrencyValue cents={false}>{modifier.amount}</CurrencyValue>,
                "amountTotal": null,
                "mode": "data"
            });
        });

        // Set the very last modifier to a sumAfter
        rows[rows.length - 1]['mode'] = 'sumAfter';

        rows.push({
            "label": "Estimated Value",
            "amount": null,
            "amountTotal": <CurrencyValue cents={false}>{this.props.appraisal.stabilizedStatement.valuation}</CurrencyValue>,
            "mode": "title"
        });

        rows.push({
            "label": "Rounded",
            "amount": null,
            "amountTotal": <CurrencyValue cents={false}>{this.props.appraisal.stabilizedStatement.valuationRounded}</CurrencyValue>,
            "mode": "data"
        });

        let minCompSize = null;
        let maxCompSize = null;

        let minCapRate = null;
        let maxCapRate = null;
        let capRateTotal = 0;
        let capRateCount = 0;
        let capRates = [];

        this.props.comparableSales.forEach((comp) =>
        {
            if (comp.sizeSquareFootage)
            {
                if (minCompSize === null || comp.sizeSquareFootage < minCompSize)
                {
                    minCompSize = comp.sizeSquareFootage;
                }

                if (maxCompSize === null || comp.sizeSquareFootage > maxCompSize)
                {
                    maxCompSize = comp.sizeSquareFootage;
                }
            }

            if (comp.displayCapitalizationRate)
            {
                if (minCapRate === null || comp.displayCapitalizationRate < minCapRate)
                {
                    minCapRate = comp.displayCapitalizationRate;
                }

                if (maxCapRate === null || comp.displayCapitalizationRate > maxCapRate)
                {
                    maxCapRate = comp.displayCapitalizationRate;
                }

                capRateTotal += comp.displayCapitalizationRate;
                capRateCount += 1;
                capRates.push(comp.displayCapitalizationRate);
            }
        });

        let capRateAverage = 0;
        if (capRateCount)
        {
            capRateAverage = capRateTotal / capRateCount;
        }

        let capRateMedian = jStat.median(capRates);

        return (
            <html>
            <body style={{"width": "7in"}}>
            <br/>
            <h4 style={{"textAlign": "center", "color": "black"}}>Capitalization Valuation</h4>
            <h5 style={subHeaderStyle}>{this.props.appraisal.address}</h5>

            <p>In estimating the capitalization rate for the subject we have analyzed sales of similar {this.props.appraisal.propertyType ? this.props.appraisal.propertyType.toString() + " " : ""}
                properties. Research included {this.props.appraisal.propertyType ? this.props.appraisal.propertyType.toString() + " " : ""}properties between <IntegerFormat value={minCompSize} /> and <IntegerFormat value={maxCompSize} /> square feet.
                Relevant details of comparable sales are summarized in the chart below.</p>

            <StyledTable
                headers={["Index \n Date", "Address", "Sale Price", "Leasable Area \n (Occupancy)", "Net Income \n PSF", "Capitalization Rate"]}
                rows={this.props.comparableSales}
                fontSize={10}
                columnSizes={[
                    "10%",
                    "35%",
                    "15%",
                    "12.5%",
                    "15%",
                    "12.5%"
                ]}
                fields={{
                    "saleDate": (saleDate, obj, objIndex) => <span style={{"textAlign": "left"}}><span>{objIndex + 1}</span><br/><Moment format="M/YY">{obj.saleDate}</Moment></span>,
                    "address": (address) => <Value>{address}</Value>,
                    "salePrice": (salePrice) => <CurrencyValue>{salePrice}</CurrencyValue>,
                    "sizeSquareFootage": (sizeSquareFootage, obj) => <span style={{"textAlign": "center"}}><AreaFormat value={sizeSquareFootage} /><br /><PercentFormat value={obj.occupancyRate} /></span>,
                    "netOperatingIncome": (netOperatingIncome, obj) => <span style={{"textAlign": "center"}}><CurrencyValue>{netOperatingIncome}</CurrencyValue><br /><CurrencyValue>{obj.netOperatingIncomePSF}</CurrencyValue></span>,
                    "displayCapitalizationRate": (displayCapitalizationRate, obj) => <span style={{"textAlign": "center"}}><PercentFormat value={obj.displayCapitalizationRate} /></span>,
                }} />

            <br/>
            <p>As detailed above, the sales show a range in capitalization rates from <PercentFormat value={minCapRate} /> to <PercentFormat value={maxCapRate} />.
                The average rate of the comparable sales is <PercentFormat value={capRateAverage} />, with most comparable sales being above <PercentFormat value={capRateMedian} />.
                The range is mostly attributed to differences in location and sale date. A summary of the comparable sales is presented below.</p>
            <br />
            <ComparableSalesSummaries comparableSales={this.props.comparableSales}/>
            <br/>
            <h4 style={{"textAlign": "left", "color": "black"}}>Summary</h4>
            <p>
                The comparable sales detailed above indicate a range in capitalization rates from <PercentFormat value={minCapRate}/> to <PercentFormat value={maxCapRate} />. It is our opinion that a capitalization rate of <PercentFormat value={this.props.appraisal.stabilizedStatementInputs.capitalizationRate} /> is reasonable
                for the subject property. A capitalization rate of <PercentFormat value={this.props.appraisal.stabilizedStatementInputs.capitalizationRate} />, applied to the subject NOI is detailed below:
            </p>
            <br />
            <FinancialTable rows={rows} />
            <br/>
            <h3 style={resultStyle}>Final Value by the Overall Capitalization Approach <br /> <CurrencyValue cents={false} center>{this.props.appraisal.stabilizedStatement.valuationRounded}</CurrencyValue></h3>
            </body>
            </html>
        )
    }
}


renderDocument((data) =>
{
    const appraisal = AppraisalModel.create(data.appraisal);
    const comparableSales = data.comparableSales.map((comp) => ComparableSaleModel.create(comp));

    return <App
        comparableSales={comparableSales}
        appraisal={appraisal}
    />;
});

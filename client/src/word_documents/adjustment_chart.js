import React from 'react'
import {getCity, getStreetAddress} from "./utilities";
import Moment from "react-moment";
import CurrencyFormat from "../pages/components/CurrencyFormat";
import AreaFormat from "../pages/components/AreaFormat";
import FieldDisplayEdit from "../pages/components/FieldDisplayEdit";
import PercentFormat from "../pages/components/PercentFormat";


class AdjustmentChart extends React.Component {
    render()
    {
        const tableCellStyle = {
            "border": "1px solid white",
            // "width": "6.4in",
            "backgroundColor": "#f2f2f2",
            "fontSize": "10px",
            "paddingBottom": "0px"
        };

        const tableHeaderStyle = {
            "backgroundColor": "#92D050",
            "color": "white",
            "fontWeight": "bold",
            "fontSize": "12px",
            "paddingBottom": "0px"
        };

        const tableSubHeaderStyle = {
            "backgroundColor": "#92D050",
            "color": "white",
            "fontWeight": "bold",
            "fontSize": "12px",
            "paddingBottom": "0px",
            "textAlign": "center"
        };

        const tableCompValueCellStyle = {
            "backgroundColor": "#E2EFD9",
            "paddingLeft": "10px",
            // "color": "white",
            "fontWeight": "bold",
            "fontSize": "10px",
            "paddingBottom": "0px"
        };

        const headerSpanStyle = {
            "marginTop": "4px",
            "marginLeft": "6px",
            "fontSize": "12px"
        };

        const leftSpanStyle = {
            "marginLeft": "3px",
            "paddingBottom": "0px",
            "marginBottom": "0px"
        };


        const valueSpanStyle = {
            "paddingBottom": "0px",
            "marginBottom": "0px",
            "textAlign": "center"
        };

        return (
            <center>
                <div>
                    <table>
                        <tbody>
                        <tr>
                            <td colSpan={1 + this.props.comparableSales.length} style={tableHeaderStyle}>
                                <span style={headerSpanStyle}>{this.props.appraisal.address} - Summary of Adjustments to Comparable Sales</span>
                            </td>
                        </tr>

                        <tr>
                            <td style={tableSubHeaderStyle} />
                            {
                                this.props.comparableSales.map((comp, compIndex) =>
                                {
                                    return <td key={compIndex} style={tableSubHeaderStyle}>
                                        <span style={valueSpanStyle}>Sale #{compIndex + 1}</span>
                                    </td>;
                                })
                            }
                        </tr>

                        <tr>
                            <td style={tableSubHeaderStyle} />
                            {
                                this.props.comparableSales.map((comp, compIndex) =>
                                {
                                    return <td key={compIndex} style={tableSubHeaderStyle}>
                                        <span style={valueSpanStyle}>{getStreetAddress(comp.address)}</span>
                                    </td>;
                                })
                            }
                        </tr>

                        <tr>
                            <td style={tableCompValueCellStyle}><span style={leftSpanStyle}>Location</span></td>
                            {
                                this.props.comparableSales.map((comp, compIndex) =>
                                {
                                    return <td key={compIndex} style={tableCellStyle}>
                                        <span style={valueSpanStyle}>{getCity(comp.address)}</span>
                                    </td>;
                                })
                            }
                        </tr>
                        <tr>
                            <td style={tableCompValueCellStyle}><span style={leftSpanStyle}>Date</span></td>
                            {
                                this.props.comparableSales.map((comp, compIndex) =>
                                {
                                    return <td key={compIndex} style={tableCellStyle}>
                                        <span style={valueSpanStyle}><Moment value={comp.saleDate} format={"YYYY-MM-DD"} /></span>
                                    </td>;
                                })
                            }
                        </tr>
                        <tr>
                            <td style={tableCompValueCellStyle}><span style={leftSpanStyle}>Sale Price</span></td>
                            {
                                this.props.comparableSales.map((comp, compIndex) =>
                                {
                                    return <td key={compIndex} style={tableCellStyle}>
                                        <span style={valueSpanStyle}><CurrencyFormat value={comp.salePrice} cents={false} /></span>
                                    </td>;
                                })
                            }
                        </tr>
                        <tr>
                            <td style={tableCompValueCellStyle}><span style={leftSpanStyle}>Property Size (acres)</span></td>
                            {
                                this.props.comparableSales.map((comp, compIndex) =>
                                {
                                    return <td key={compIndex} style={tableCellStyle}>
                                        <span style={valueSpanStyle}><AreaFormat value={comp.sizeOfLandAcres} /></span>
                                    </td>;
                                })
                            }
                        </tr>
                        <tr>
                            <td style={tableCompValueCellStyle}><span style={leftSpanStyle}>$ / acres</span></td>
                            {
                                this.props.comparableSales.map((comp, compIndex) =>
                                {
                                    return <td key={compIndex} style={tableCellStyle}>
                                        <span style={valueSpanStyle}><CurrencyFormat value={comp.pricePerAcreLand} cents={false} /></span>
                                    </td>;
                                })
                            }
                        </tr>
                        <tr>
                            <td style={tableCompValueCellStyle} />
                            {
                                this.props.comparableSales.map((comp, compIndex) =>
                                {
                                    return <td key={compIndex} style={tableCellStyle}>

                                    </td>;
                                })
                            }
                        </tr>
                        {
                            this.props.appraisal.adjustmentChart.adjustments.map((adjustment, adjustmentIndex) =>
                            {
                                return <tr key={adjustmentIndex}>
                                    <td style={tableCompValueCellStyle}><span style={leftSpanStyle}>{adjustment.name}</span></td>
                                    {
                                        this.props.comparableSales.map((comp, compIndex) =>
                                        {
                                            return <td key={compIndex} style={tableCellStyle}>
                                                <span style={valueSpanStyle}>
                                                    {
                                                        adjustment.adjustmentType === 'amount' ?
                                                            <CurrencyFormat
                                                                value={adjustment.adjustmentAmounts[comp._id]}
                                                                cents={false}
                                                            /> : null
                                                    }
                                                    {
                                                        adjustment.adjustmentType === 'percentage' ?
                                                            <PercentFormat
                                                                value={adjustment.adjustmentPercentages[comp._id]}
                                                            /> : null
                                                    }
                                                    {
                                                        adjustment.adjustmentType === 'text' ?
                                                            <span>{adjustment.adjustmentText[comp._id]}</span>
                                                            : null
                                                    }
                                                </span>
                                            </td>;
                                        })
                                    }
                                </tr>
                            })
                        }
                        <tr>
                            <td style={tableCompValueCellStyle}><span style={leftSpanStyle}>Adjusted $ / acre</span></td>
                            {
                                this.props.comparableSales.map((comp, compIndex) =>
                                {
                                    return <td key={compIndex} style={tableCellStyle}>
                                        {/*<CurrencyFormat value={comp.pricePerAcreLand} cents={false} />*/}
                                    </td>;
                                })
                            }
                        </tr>
                        </tbody>
                    </table>
                </div>
            </center>
        )
    }
}

export default AdjustmentChart;


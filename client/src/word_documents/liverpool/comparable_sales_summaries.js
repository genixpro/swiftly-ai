import React from 'react'
import { renderToString } from 'react-dom/server'
import readJSONInput from "../read_json_input";
import fs from "fs";
import Moment from 'react-moment';
import _ from "underscore";
import NumberFormat from 'react-number-format';
import FieldsTable from "../fields_table";
import {Value, CurrencyValue, PercentValue, IntegerValue, AreaValue} from "../value";
import {Spacer} from "../spacer";
import renderDocument from "../render_doc";
import CurrencyFormat from "../../pages/components/CurrencyFormat";
import ComparableMarkerMap from "../comparable_marker_map";
import proxy from "../../proxy";


class ComparableSalesSummaries extends React.Component {
    render()
    {
        const mainImageStyle = {
            "marginLeft": "0.5in",
            "marginRight": "0.5in",
            "width": "4.8in",
            "height": "3.6in",
            "border": "1px solid black",
            // "paddingLeft": "1.0in",
            // "paddingRight": "1.0in"
        };

        const subImageStyle = {
            // "marginLeft": "0.5in",
            // "marginRight": "0.5in",
            "width": "3.2in",
            "height": "2.4in",
            "border": "1px solid black",
            // "paddingLeft": "1.0in",
            // "paddingRight": "1.0in"
        };

        const tableCellStyle = {
            "border": "1px solid white",
            // "width": "6.4in",
            "backgroundColor": "#f2f2f2"
        };

        const tableHeaderStyle = {
            "backgroundColor": "#92D050",
            "color": "white",
            "fontWeight": "bold"
        };

        const tableCompValueCellStyle = {
            "backgroundColor": "#E2EFD9",
            "paddingLeft": "10px",
            // "color": "white",
            "fontWeight": "bold"
        };

        const tableValueStyle = {
            "marginLeft": "10px"
        };

        return (
            <center>
            <div>
                <ComparableMarkerMap comparableSales={this.props.comparableSales} appraisal={this.props.appraisal} />
                {
                    this.props.comparableSales.map((comp, compIndex) =>
                    {
                        const imgElem =
                            <img
                                src={proxy(comp.imageUrls.length ? (comp.imageUrls[0]) : "https://maps.googleapis.com/maps/api/streetview?key=AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I&size=640x480&source=outdoor&location=" + comp.address)}
                                style={mainImageStyle}
                            />
                        ;

                        const descriptionElem =
                            <td style={tableCellStyle}>
                                <span style={{"fontWeight": "bold"}}>Index {compIndex + 1} - {comp.address}:</span> {comp.description || comp.computedDescriptionText}
                            </td>;

                        return <div key={compIndex} style={{"pageBreakAfter": "always"}}>
                            <table className={""} style={{"color": "white"}} key={compIndex}>
                            <tbody>
                            <tr>
                                <td colSpan={4} style={tableHeaderStyle}>Sale {compIndex + 1}: {comp.address}</td>
                            </tr>
                            <tr>
                                <td style={tableCellStyle} colSpan={4}>
                                <center>
                                {imgElem}
                                </center>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={4} style={tableHeaderStyle}><strong style={tableValueStyle}>Property Details</strong></td>
                            </tr>
                            <tr>
                                <td style={tableCompValueCellStyle} width="25%"><strong style={tableValueStyle}>Sale Price</strong></td>
                                <td style={tableCellStyle} width="25%"><span style={tableValueStyle}><CurrencyFormat value={comp.salePrice} /></span></td>
                                <td style={tableCompValueCellStyle} width="25%"><strong style={tableValueStyle}>Development Applications</strong></td>
                                <td style={tableCellStyle} width="25%"><span style={tableValueStyle}>{comp.developmentProposals}</span></td>
                            </tr>
                            <tr>
                                <td style={tableCompValueCellStyle} width="25%"><strong style={tableValueStyle}>Sale Date</strong></td>
                                <td style={tableCellStyle} width="25%"><span style={tableValueStyle}><Moment value={comp.saleDate} format={"MMMM DD, YYYY"} /></span></td>
                                <td style={tableCompValueCellStyle} width="25%"><strong style={tableValueStyle}>Vendor Take Back %</strong></td>
                                <td style={tableCellStyle} width="25%"><span style={tableValueStyle}><PercentValue value={comp.occupancyRate} /></span></td>
                            </tr>
                            <tr>
                                <td style={tableCompValueCellStyle} width="25%"><strong style={tableValueStyle}>Site Area</strong></td>
                                <td style={tableCellStyle} width="25%"><span style={tableValueStyle}>{comp.siteArea}</span></td>
                                <td style={tableCompValueCellStyle} width="25%"><strong style={tableValueStyle}>Vendor</strong></td>
                                <td style={tableCellStyle} width="25%"><span style={tableValueStyle}>{comp.vendor}</span></td>
                            </tr>
                            <tr>
                                <td style={tableCompValueCellStyle} width="25%"><strong style={tableValueStyle}>$ / acre</strong></td>
                                <td style={tableCellStyle} width="25%"><span style={tableValueStyle}>{comp.pricePerAcreLand}</span></td>
                                <td style={tableCompValueCellStyle} width="25%"><strong style={tableValueStyle}>Purchaser</strong></td>
                                <td style={tableCellStyle} width="25%"><span style={tableValueStyle}>{comp.purchaser}</span></td>
                            </tr>
                            <tr>
                                <td colSpan={2} style={tableCellStyle}>
                                    <center>
                                    <img src={proxy(`https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I&size=640x480&zoom=13&center=${comp.address}`)}
                                         style={subImageStyle}
                                    />
                                    </center>
                                </td>
                                <td colSpan={2} style={tableCellStyle}>
                                    <center>
                                    <img src={proxy(`https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I&size=640x480&zoom=13&center=${comp.address}&maptype=satellite`)}
                                         style={subImageStyle}
                                    />
                                    </center>
                                </td>
                            </tr>
                            </tbody>

                        </table>
                        <br/><br/>
                    </div>
                    })
                }
            </div></center>
        )
    }
}

export default ComparableSalesSummaries;


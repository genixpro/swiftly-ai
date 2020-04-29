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
import proxy from "../../proxy";


class ComparableSalesSummaries extends React.Component {
    render()
    {
        const imageStyle = {
            "marginLeft": "auto",
            "marginRight": "auto",
            "width": "3.2in",
            "height": "2.4in",
            "border": "1px solid black"
        };

        const tableStyle = {
            "border": "0px solid white"
        };

        return (
            <div>
                {
                    this.props.comparableSales.map((comp, compIndex) =>
                    {
                        const imgElem = <td style={tableStyle}>
                            <img
                                src={proxy(comp.imageUrls.length ? (comp.imageUrls[0]) : "https://maps.googleapis.com/maps/api/streetview?key=AIzaSyDfDNwiviqhg0DLZR-MyCR7GEqu1-Ku-ak&size=640x480&source=outdoor&location=" + comp.address)}
                                style={imageStyle}
                            />
                        </td>;

                        const descriptionElem =
                            <td style={tableStyle}>
                                <span style={{"fontWeight": "bold"}}>Index {compIndex + 1} - {comp.address}:</span> {comp.description || comp.computedDescriptionText}
                            </td>;

                        if (compIndex % 2 === 0)
                        {
                            return <table key={compIndex} style={tableStyle}>
                                <tbody style={tableStyle}>
                                        <tr style={tableStyle}>
                                        {imgElem}
                                        {descriptionElem}
                                    </tr>
                                </tbody>
                            </table>;
                        }
                        else
                        {
                            return <table key={compIndex} style={tableStyle}>
                            <tbody style={tableStyle}>
                            <tr style={tableStyle}>
                                {descriptionElem}
                                {imgElem}
                            </tr>
                            </tbody>
                            </table>;
                        }
                    })
                }
            </div>
        )
    }
}

export default ComparableSalesSummaries;


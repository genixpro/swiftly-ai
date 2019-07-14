import React from 'react'
import { renderToString } from 'react-dom/server'
import readJSONInput from "./read_json_input";
import fs from "fs";
import Moment from 'react-moment';
import _ from "underscore";
import NumberFormat from 'react-number-format';
import FieldsTable from "./fields_table";
import {Value, CurrencyValue, PercentValue, IntegerValue, AreaValue} from "./value";
import {Spacer} from "./spacer";
import renderDocument from "./render_doc";


class ComparableSalesSummaries extends React.Component {
    render()
    {
        const imageStyle = {
            "marginLeft": "auto",
            "marginRight": "auto",
            "width": "2.4in",
            "height": "1.8in",
            "border": "1px solid black"
        };

        return (
            <div>
                {
                    this.props.comparableSales.map((comp, compIndex) =>
                    {
                        const imgElem = <td width={"30%"}>
                            <img
                                src={comp.imageUrls.length ? (comp.imageUrls[0]) : "https://maps.googleapis.com/maps/api/streetview?key=AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I&size=640x480&source=outdoor&location=" + comp.address}
                                style={imageStyle}
                            />
                        </td>;

                        const descriptionElem =
                            <td width={"70%"}>
                                <span style={{"fontWeight": "bold"}}>Index {compIndex + 1} - {comp.address}:</span> {comp.description || comp.computedDescriptionText}
                            </td>;

                        if (compIndex % 2 === 0)
                        {
                            return <table>
                                <tbody>
                                        <tr key={compIndex}>
                                        {imgElem}
                                        {descriptionElem}
                                    </tr>
                                </tbody>
                            </table>;
                        }
                        else
                        {
                            return <table>
                            <tbody>
                            <tr key={compIndex}>
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


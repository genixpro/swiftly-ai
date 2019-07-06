import React from 'react'
import { renderToString } from 'react-dom/server'
import readJSONInput from "./read_json_input";
import fs from "fs";
import Moment from 'react-moment';
import _ from "underscore";
import NumberFormat from 'react-number-format';
import CustomTable from "./styled_table";
import {Value, CurrencyValue, PercentValue} from "./value";
import Spacer from "./spacer";
import renderDocument from "./render_doc";

class ComparableSalesTable extends React.Component {
    render()
    {
        let fields = [];

        if (!this.props.fields)
        {
            fields = ["saleDate", "address", "salePrice", "sizeSquareFootage", "capitalizationRate"]
        }


        return (
            <CustomTable
                headers={["Date", "Address", "Consideration", "Building Size", "Cap Rate"]}
                rows={this.props.comparableSales}
                fields={{
                    "saleDate.$date": (saleDate) => <Value><Moment format="MMMM YYYY">{saleDate}</Moment></Value>,
                    "address": (address) => <Value>{address}</Value>,
                    "salePrice": (salePrice) => <CurrencyValue>{salePrice}</CurrencyValue>,
                    "sizeSquareFootage": (sizeSquareFootage) => <Value>{sizeSquareFootage}</Value>,
                    "capitalizationRate": (capitalizationRate) => <PercentValue>{capitalizationRate}</PercentValue>
                }} />
        )
    }
}

export default ComparableSalesTable;

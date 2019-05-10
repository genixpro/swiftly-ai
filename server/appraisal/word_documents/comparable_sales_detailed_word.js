
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


class App extends React.Component {
    render()
    {
        const imageStyle = {
            "marginLeft": "auto",
            "marginRight": "auto",
            "width": "6.4in",
            "height": "4.8in",
            "border": "1px solid black"
        };

        return (
            <html>
            <body>
            <br/>
            <h1>Comparable Sales</h1>
            <br/>
            <br/>
            {
                this.props.comparableSales.map((comp, compIndex) =>
                {
                    return [
                            <div key={compIndex.toString()}>
                                <h2>{comp.address}</h2>
                                <img
                                    src={comp.imageUrl ? (comp.imageUrl) : "https://maps.googleapis.com/maps/api/streetview?key=AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I&size=640x480&source=outdoor&location=" + comp.address}
                                    style={imageStyle}
                                />
                                <br/>
                                <br/>
                                <FieldsTable
                                    key={"fields" + compIndex.toString()}
                                    friendlyNames={{
                                        "saleDate": "Date of Sale",
                                        "vendor": "Vendor",
                                        "purchaser": "Purchaser",
                                        "salePrice": "Consideration",
                                        "siteArea": "Site Area",
                                        "description": "Description",
                                        "sizeSquareFootage": "Building Size",
                                        "pricePerSquareFoot": "Price PSF of Building",
                                        "capitalizationRate": "Cap Rate"
                                    }}
                                    fields={{
                                        "saleDate": (saleDate) => <Value><Moment format="MMMM YYYY">{saleDate["$date"]}</Moment></Value>,
                                        "vendor": (vendor) => <Value>{vendor}</Value>,
                                        "purchaser": (purchaser) => <Value>{purchaser}</Value>,
                                        "salePrice": (salePrice) => <CurrencyValue left={true}>{salePrice}</CurrencyValue>,
                                        "siteArea": (siteArea) => <IntegerValue left={true}>{siteArea}</IntegerValue>,
                                        "description": (description) => <Value>{description}</Value>,
                                        "sizeSquareFootage": (sizeSquareFootage) => <AreaValue left={true}>{sizeSquareFootage}</AreaValue>,
                                        "pricePerSquareFoot": (pricePerSquareFoot) => <CurrencyValue left={true}>{pricePerSquareFoot}</CurrencyValue>,
                                        "capitalizationRate": (capitalizationRate) => <PercentValue left={true}>{capitalizationRate}</PercentValue>
                                    }}
                                    value={comp}
                                />
                                <br/>
                                <br/>
                        </div>
                    ]
                })
            }

            </body>
            </html>
        )
    }
}

renderDocument((data) =>
{
    return <App
        appraisal={data.appraisal}
        comparableSales={data.comparableSales}
    />;
});


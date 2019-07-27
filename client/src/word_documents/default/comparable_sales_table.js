import React from 'react'
import Moment from 'react-moment';
import StyledTable from "../styled_table";
import {Value, CurrencyValue, PercentValue} from "../value";
import CurrencyFormat from "../../pages/components/CurrencyFormat";

class ComparableSalesTable extends React.Component {
    render()
    {
        let fields = [];
        if (!this.props.fields)
        {
            fields = ["saleDate", "address", "salePrice", "sizeSquareFootage", "capitalizationRate"]
        }
        else
        {
            fields = this.props.fields;
        }

        let fieldDefinitions = {};

        for(let field of fields)
        {
            if (field === 'saleDate')
            {
                fieldDefinitions["saleDate.$date"] = (saleDate) => <Value><Moment format="MMMM YYYY">{saleDate}</Moment></Value>;
            }
            else if(field === 'address')
            {
                fieldDefinitions["address"] = (address) => <Value>{address}</Value>;
            }
            else if(field === 'salePrice')
            {
                fieldDefinitions["salePrice"] = (salePrice) => <CurrencyValue>{salePrice}</CurrencyValue>;
            }
            else if(field === 'sizeSquareFootage')
            {
                fieldDefinitions["sizeSquareFootage"] = (sizeSquareFootage) => <span style={{"textAlign": "right"}}><Value>{sizeSquareFootage}</Value></span>;
            }
            else if(field === 'capitalizationRate')
            {
                fieldDefinitions["capitalizationRate"] = (capitalizationRate) => <PercentValue>{capitalizationRate}</PercentValue>;
            }
            else if(field === 'pricePerSquareFoot')
            {
                fieldDefinitions["pricePerSquareFoot"] = (pricePerSquareFoot) => <span style={{"textAlign": "center"}}><CurrencyFormat value={pricePerSquareFoot} /></span>;
            }
            else if(field === 'netOperatingIncomePSF')
            {
                fieldDefinitions["netOperatingIncomePSF"] = (netOperatingIncomePSF) => <CurrencyValue center>{netOperatingIncomePSF}</CurrencyValue>;
            }
        }


        return (
            <StyledTable
                headers={["Date", "Address", "Consideration", "Building Size", "Cap Rate"]}
                rows={this.props.comparableSales}
                fields={fieldDefinitions}
                columnSizes={[
                    "15%",
                    "40%",
                    "15%",
                    "15%",
                    "15%"
                ]}
            />
        )
    }
}

export default ComparableSalesTable;

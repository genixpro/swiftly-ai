import React from 'react'
import Moment from 'react-moment';
import StyledTable from "../styled_table";
import {Value, CurrencyValue, PercentValue} from "../value";

class ComparableSalesTable extends React.Component {
    render()
    {
        let fields = [];

        // if (!this.props.fields)
        // {
        //     fields = ["saleDate", "address", "salePrice", "sizeSquareFootage", "capitalizationRate"]
        // }


        return (
            <StyledTable
                headers={["Date", "Address", "Consideration", "Building Size", "Cap Rate"]}
                rows={this.props.comparableSales}
                fields={{
                    "saleDate.$date": (saleDate) => <Value><Moment format="MMMM YYYY">{saleDate}</Moment></Value>,
                    "streetAddress": (address, obj) => <Value>{obj.streetAddress}</Value>,
                    "city": (address, obj) => <Value>{obj.city}</Value>,
                    "salePrice": (salePrice) => <CurrencyValue>{salePrice}</CurrencyValue>,
                    "sizeSquareFootage": (sizeSquareFootage) => <span style={{"textAlign": "right"}}><Value>{sizeSquareFootage}</Value></span>,
                    "capitalizationRate": (capitalizationRate) => <PercentValue>{capitalizationRate}</PercentValue>
                }}
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

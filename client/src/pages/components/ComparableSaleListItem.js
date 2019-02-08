import React from 'react';


class ComparableSaleListItem extends React.Component
{
    render()
    {
        const comparableSale = this.props.comparableSale;
        return (
            <tr onClick={(evt) => this.props.history.push("/appraisal/" + this.props.appraisalId + "/comparable_sale/" + this.props.comparableSale._id['$oid'] + "/raw")}
                className={"comparable-sale-list-item"}>
                <td>{comparableSale.fileName}</td>
                <td>{comparableSale.extractedData ? comparableSale.extractedData.price_per_square_foot : ""}</td>
                <td>{comparableSale.extractedData ? comparableSale.extractedData.capitalization_rate : ""}</td>
            </tr>
        );
    }
}


export default ComparableSaleListItem;
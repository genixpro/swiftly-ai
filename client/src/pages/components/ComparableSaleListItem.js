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
            </tr>
        );
    }
}


export default ComparableSaleListItem;
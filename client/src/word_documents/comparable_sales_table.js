import React from 'react'
import LiverpoolComparableSalesTable from "./liverpool/comparable_sales_table";
import DefaultComparableSalesTable from "./default/comparable_sales_table";


class ComparableSalesTable extends React.Component {
    render()
    {
        // return <LiverpoolComparableSalesTable
        //     comparableSales={this.props.comparableSales}
        //     appraisal={this.props.appraisal}
        // />

        if (this.props.appraisal.owner === 'liverpool')
        {
            return <LiverpoolComparableSalesTable
                comparableSales={this.props.comparableSales}
                appraisal={this.props.appraisal}
            />
        }
        else
        {
            return <DefaultComparableSalesTable
                comparableSales={this.props.comparableSales}
                appraisal={this.props.appraisal}
            />

        }
    }
}

export default ComparableSalesTable;


import React from 'react'
import LiverpoolComparableSalesSummaries from "./liverpool/comparable_sales_summaries";
import DefaultComparableSalesSummaries from "./default/comparable_sales_summaries";


class ComparableSalesSummaries extends React.Component {
    render()
    {
        return <LiverpoolComparableSalesSummaries
            comparableSales={this.props.comparableSales}
            appraisal={this.props.appraisal}
        />

        // if (this.props.appraisal.owner === 'liverpool')
        // {
        //     return <LiverpoolComparableSalesSummaries
        //         comparableSales={this.props.comparableSales}
        //         appraisal={this.props.appraisal}
        //     />
        // }
        // else
        // {
        //     return <DefaultComparableSalesSummaries
        //         comparableSales={this.props.comparableSales}
        //         appraisal={this.props.appraisal}
        //     />
        //
        // }
    }
}

export default ComparableSalesSummaries;


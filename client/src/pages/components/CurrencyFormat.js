import React from 'react';
import NumberFormat from 'react-number-format';
import _ from 'underscore';


class CurrencyFormat extends React.Component
{
    static defaultProps = {
        cents: true
    };

    render()
    {
        if (_.isUndefined(this.props.value) || _.isNull(this.props.value) || _.isNaN(this.props.value))
        {
            return <span title={this.props.title}>n/a</span>;
        }

        if (this.props.value < 0)
        {
            return <span title={this.props.title}>($<NumberFormat
                value={-this.props.value || 0}
                displayType={'text'}
                thousandSeparator={', '}
                decimalScale={this.props.cents ? 2 : 0}
                fixedDecimalScale={true}
            />)</span>
        }
        else
        {
            return <span title={this.props.title}>$<NumberFormat
                value={this.props.value || 0}
                displayType={'text'}
                thousandSeparator={', '}
                decimalScale={this.props.cents ? 2 : 0}
                fixedDecimalScale={true}
            /></span>
        }
    }
}

export default CurrencyFormat;
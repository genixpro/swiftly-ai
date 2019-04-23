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
        if (_.isUndefined(this.props.value) || _.isNull(this.props.value))
        {
            return <span>n/a</span>;
        }

        return <span>$<NumberFormat
            value={this.props.value}
            displayType={'text'}
            thousandSeparator={', '}
            decimalScale={this.props.cents ? 2 : 0}
            fixedDecimalScale={true}
        /></span>
    }
}

export default CurrencyFormat;
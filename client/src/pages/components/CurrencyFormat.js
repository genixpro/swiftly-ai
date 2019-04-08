import React from 'react';
import NumberFormat from 'react-number-format';


class CurrencyFormat extends React.Component
{
    static defaultProps = {
        cents: true
    };

    render()
    {
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
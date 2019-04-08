import React from 'react';
import NumberFormat from 'react-number-format';


class IntegerFormat extends React.Component
{
    render()
    {
        return <span><NumberFormat
            value={this.props.value}
            displayType={'text'}
            thousandSeparator={', '}
            decimalScale={0}
            fixedDecimalScale={true}
        /></span>
    }
}

export default IntegerFormat;

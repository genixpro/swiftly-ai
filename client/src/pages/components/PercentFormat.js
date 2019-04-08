import React from 'react';
import NumberFormat from 'react-number-format';


class PercentFormat extends React.Component
{
    render()
    {
        return <span><NumberFormat
            value={this.props.value}
            displayType={'text'}
            thousandSeparator={', '}
            decimalScale={2}
            fixedDecimalScale={true}
        />%</span>
    }
}

export default PercentFormat;
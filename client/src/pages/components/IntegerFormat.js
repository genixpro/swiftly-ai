import React from 'react';
import NumberFormat from 'react-number-format';
import _ from 'underscore';


class IntegerFormat extends React.Component
{
    render()
    {
        if (_.isUndefined(this.props.value) || _.isNull(this.props.value))
        {
            return <span>n/a</span>;
        }

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

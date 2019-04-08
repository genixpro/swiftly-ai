import React from 'react';
import NumberFormat from 'react-number-format';
import _ from 'underscore';


class AreaFormat extends React.Component
{
    render()
    {
        if (_.isUndefined(this.props.value) || _.isNull(this.props.value))
        {
            return null;
        }

        return <span><NumberFormat
            value={this.props.value}
            displayType={'text'}
            thousandSeparator={', '}
            decimalScale={0}
            fixedDecimalScale={true}
        /> sf</span>
    }
}

export default AreaFormat;

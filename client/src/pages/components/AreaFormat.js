import React from 'react';
import NumberFormat from 'react-number-format';
import _ from 'underscore';


class AreaFormat extends React.Component
{
    static defaultProps = {
        spaces: true
    };

    render()
    {
        if (_.isUndefined(this.props.value) || _.isNull(this.props.value))
        {
            return <span>n/a</span>;
        }

        return <span><NumberFormat
            value={this.props.value}
            displayType={'text'}
            thousandSeparator={this.props.spaces ? ', ' : ","}
            decimalScale={0}
            fixedDecimalScale={true}
        /> sf</span>
    }
}

export default AreaFormat;

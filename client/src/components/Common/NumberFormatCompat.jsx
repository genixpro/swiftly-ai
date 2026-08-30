import React from 'react';
import {NumericFormat} from 'react-number-format';

export default function NumberFormatCompat({isNumericString, ...props}) {
    return <NumericFormat valueIsNumericString={isNumericString} {...props}/>;
}

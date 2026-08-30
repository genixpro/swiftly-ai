import {NumericFormat, type NumericFormatProps} from 'react-number-format';

interface NumberFormatCompatProps extends NumericFormatProps {
    isNumericString?: boolean;
}

export default function NumberFormatCompat({isNumericString, ...props}: NumberFormatCompatProps) {
    return <NumericFormat valueIsNumericString={isNumericString} {...props}/>;
}

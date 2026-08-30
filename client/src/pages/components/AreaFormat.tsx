import NumberFormat from '@components/Common/NumberFormatCompat';

interface AreaFormatProps {
    value?: number | string | null;
    spaces?: boolean;
}

export default function AreaFormat({value, spaces = false}: AreaFormatProps) {
    if (value == null) return <span>n/a</span>;
    return <span><NumberFormat value={value} displayType="text" thousandSeparator={spaces ? ', ' : ','} decimalScale={0} fixedDecimalScale /> sf</span>;
}

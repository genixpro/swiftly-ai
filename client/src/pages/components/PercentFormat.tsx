import NumberFormat from '@components/Common/NumberFormatCompat';

interface PercentFormatProps {
    value?: number | string | null;
    digits?: number;
}

export default function PercentFormat({value, digits = 2}: PercentFormatProps) {
    if (value == null) return <span>n/a</span>;
    return <span><NumberFormat value={value} displayType="text" thousandSeparator="," decimalScale={digits} fixedDecimalScale />%</span>;
}

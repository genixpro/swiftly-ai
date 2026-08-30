import NumberFormat from '@components/Common/NumberFormatCompat';

export default function IntegerFormat({value}: {value?: number | string | null}) {
    if (value == null) return <span>n/a</span>;
    return <span><NumberFormat value={value} displayType="text" thousandSeparator="," decimalScale={0} fixedDecimalScale /></span>;
}

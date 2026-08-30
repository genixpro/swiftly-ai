import NumberFormat from '@components/Common/NumberFormatCompat';

interface CurrencyFormatProps {
    value?: number | null;
    cents?: boolean;
    title?: string;
}

export default function CurrencyFormat({value, cents = true, title}: CurrencyFormatProps) {
    if (value == null || Number.isNaN(value)) return <span title={title}>n/a</span>;
    const formatted = <NumberFormat value={Math.abs(value) || 0} displayType="text" thousandSeparator="," decimalScale={cents ? 2 : 0} fixedDecimalScale />;
    return <span title={title}>{value < 0 ? <>(${formatted})</> : <>${formatted}</>}</span>;
}

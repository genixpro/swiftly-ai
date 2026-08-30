import SelectorControl, {type SelectorProps} from './SelectorControl';

const calculationFieldNames: Record<string, string> = {
    operatingExpenses: 'Operating Expenses',
    operatingExpensesAndTaxes: 'Operating Expenses & Taxes',
    managementExpenses: 'Management Expenses',
    taxes: 'Taxes',
    effectiveGrossIncome: 'Effective Gross Income',
    rentalIncome: 'Rental Income',
};

export function nameForCalculationField(field: string): string {
    return calculationFieldNames[field] ?? '';
}

export function CalculationFieldSelector({expenses, ...props}: SelectorProps & {expenses?: unknown[]}) {
    if (!expenses) return null;
    return <SelectorControl {...props} options={[
        {value: '', label: '\u00a0'},
        ...Object.entries(calculationFieldNames).map(([value, label]) => ({value, label})),
    ]} />;
}

export default CalculationFieldSelector;

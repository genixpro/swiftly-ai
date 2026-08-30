import SelectorControl, {type SelectorProps} from './SelectorControl';

export default function IncomeItemTypeSelector({cashFlowType, ...props}: SelectorProps & {cashFlowType?: 'income' | 'expense'}) {
    const includeIncome = cashFlowType === 'income' || !cashFlowType;
    const includeExpense = cashFlowType === 'expense' || !cashFlowType;
    return <SelectorControl {...props} mutedWhenEmpty={false} options={[
        {value: '', label: cashFlowType === 'expense' ? 'Expense Type' : 'Income Type'},
        ...(includeIncome ? [{value: 'rental_income', label: 'Rental Income'}, {value: 'additional_income', label: 'Additional Income'}, {value: 'expense_recovery', label: 'Expense Recoveries'}] : []),
        ...(includeExpense ? [{value: 'operating_expense', label: 'Operating Expense'}, {value: 'non_recoverable_expense', label: 'Non Recoverable Expense'}, {value: 'taxes', label: 'Taxes'}, {value: 'management_expense', label: 'Management Expense'}, {value: 'structural_allowance', label: 'Structural Allowance'}] : []),
        {value: 'unknown', label: 'Unknown'},
    ]} />;
}

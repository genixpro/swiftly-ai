import SelectorControl, {type SelectorProps} from './SelectorControl';

export default function ManagementExpenseModeSelector({exclude = [], ...props}: SelectorProps & {exclude?: string[]}) {
    const options = [
        {value: 'income_statement', label: 'Based on Expense Statement'},
        {value: 'rule', label: 'Based on Industry Rate'},
        {value: 'combined_structural_rule', label: 'Combine with Structural Allowance'},
    ].filter(option => !exclude.includes(option.value));
    return <SelectorControl {...props} options={options} />;
}

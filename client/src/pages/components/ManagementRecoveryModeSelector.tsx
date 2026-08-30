import SelectorControl, {type SelectorProps} from './SelectorControl';

export default function ManagementRecoveryModeSelector(props: SelectorProps) {
    return <SelectorControl {...props} options={[
        {value: 'none', label: 'No Management Recovery'},
        {value: 'operatingExpenses', label: 'Operating Expenses'},
        {value: 'operatingExpensesAndTaxes', label: 'Operating Expenses & Taxes'},
        {value: 'managementExpenses', label: 'Management Expenses'},
        {value: 'custom', label: 'Custom'},
    ]} />;
}

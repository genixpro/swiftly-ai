import SelectorControl, {type SelectorProps} from './SelectorControl';

export default function RentTypeSelector(props: SelectorProps) {
    return <SelectorControl {...props} options={[
        {value: '', label: 'No Rent Type'},
        {value: 'net', label: 'Net Rent'},
        {value: 'gross', label: 'Gross Rent'},
    ]} />;
}

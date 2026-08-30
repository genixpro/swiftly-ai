import SelectorControl, {type SelectorProps} from './SelectorControl';

export default function AdjustmentTypeSelector(props: SelectorProps) {
    return <SelectorControl {...props} options={[
        {value: 'percentage', label: '(%)'},
        {value: 'amount', label: '($)'},
        {value: 'text', label: 'text'},
    ]} />;
}

import SelectorControl, {type SelectorProps} from './SelectorControl';

export default function RetailLocationTypeSelector(props: SelectorProps) {
    return <SelectorControl {...props} useClick notifyUnchanged mutedWhenEmpty={false} options={[
        {value: '', label: ''},
        {value: 'street_front', label: 'Street Front'},
        {value: 'upper_level', label: 'Upper Level'},
    ]} />;
}

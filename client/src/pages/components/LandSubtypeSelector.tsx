import SelectorControl, {type SelectorProps} from './SelectorControl';

export default function LandSubtypeSelector(props: SelectorProps) {
    return <SelectorControl {...props} useClick notifyUnchanged mutedWhenEmpty={false} className="form-select mb-3" options={[
        {value: 'residential', label: 'Residential Land'},
        {value: 'commercial', label: 'Commercial Land'},
    ]} />;
}

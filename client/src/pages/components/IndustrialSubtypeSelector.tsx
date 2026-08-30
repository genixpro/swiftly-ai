import SelectorControl, {type SelectorProps} from './SelectorControl';

export default function IndustrialSubtypeSelector(props: SelectorProps) {
    return <SelectorControl {...props} useClick notifyUnchanged mutedWhenEmpty={false} className="form-select mb-3" options={[
        {value: 'single_tenant', label: 'Single Tenant'},
        {value: 'multi_tenant', label: 'Multi Tenant'},
    ]} />;
}

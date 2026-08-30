import SelectorControl, {type SelectorProps} from './SelectorControl';

export default function TenancyTypeSelector(props: SelectorProps) {
    return <SelectorControl {...props} ariaLabel={props.title || props.placeholder || 'Tenancy type'} options={[
        {value: '', label: 'No Tenancy Type'},
        {value: 'single_tenant', label: 'Single Tenant'},
        {value: 'multi_tenant', label: 'Multi Tenant'},
        {value: 'vacant', label: 'Vacant'},
    ]} />;
}

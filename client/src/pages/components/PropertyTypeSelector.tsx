import SelectorControl, {type SelectorProps} from './SelectorControl';

export default function PropertyTypeSelector(props: SelectorProps) {
    return <SelectorControl {...props} ariaLabel={props.title || props.placeholder || 'Property type'} options={[
        {value: '', label: props.isSearch ? 'All' : 'Property Type'},
        {value: 'office', label: 'Office'},
        {value: 'industrial', label: 'Industrial'},
        {value: 'retail', label: 'Retail'},
        {value: 'land', label: 'Land'},
        {value: 'residential', label: 'Residential'},
    ]} />;
}

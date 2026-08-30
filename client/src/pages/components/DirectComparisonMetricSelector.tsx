import SelectorControl, {type SelectorProps} from './SelectorControl';

export default function DirectComparisonMetricSelector(props: SelectorProps) {
    return <SelectorControl {...props} options={[
        {value: '', label: 'No Metric Selected'},
        {value: 'psf', label: 'Price Per Square Foot of Building Size'},
        {value: 'noi_multiple', label: 'NOI/PSF Multiple'},
        {value: 'per_unit', label: 'Price Per Unit (Residential)'},
        {value: 'psf_land', label: 'Per Square Foot of Land'},
        {value: 'per_acre_land', label: 'Per Acre of Land'},
        {value: 'psf_buildable_area', label: 'Per Square Foot of Buildable Area'},
        {value: 'per_buildable_unit', label: 'Per Buildable Unit'},
    ]} />;
}

import SelectorControl, {type SelectorProps} from './SelectorControl';

export default function LeasingComissionModeSelector(props: SelectorProps) {
    return <SelectorControl {...props} options={[
        {value: 'psf', label: 'psf'},
        {value: 'percent_of_rent', label: '% of rent'},
    ]} />;
}

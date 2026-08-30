import SelectorControl, {type SelectorProps} from './SelectorControl';

export default function LeasingCostSelector({leasingCostStructures, ...props}: SelectorProps & {leasingCostStructures?: Array<{name: string}> | null}) {
    if (!leasingCostStructures) return null;
    return <SelectorControl {...props} options={[
        {value: '', label: 'No Leasing Costs'},
        ...leasingCostStructures.map(structure => ({value: structure.name, label: structure.name})),
    ]} />;
}

import SelectorControl, {type SelectorProps} from './SelectorControl';

export default function RecoveryStructureSelector({recoveryStructures, ...props}: SelectorProps & {recoveryStructures?: Array<{name: string}> | null}) {
    if (!recoveryStructures) return null;
    return <SelectorControl {...props} options={[
        {value: '', label: 'No Recovery Structure'},
        ...recoveryStructures.map(recovery => ({value: recovery.name, label: recovery.name})),
    ]} />;
}

import SelectorControl, {type SelectorProps} from './SelectorControl';

export default function MarketRentSelector({marketRents, ...props}: SelectorProps & {marketRents?: Array<{name: string; amountPSF: number}> | null}) {
    if (!marketRents) return null;
    return <SelectorControl {...props} options={[
        {value: '', label: 'No Market Rent'},
        ...marketRents.map(rent => ({value: rent.name, label: `${rent.name} @ $${rent.amountPSF.toFixed(2)}`})),
    ]} />;
}

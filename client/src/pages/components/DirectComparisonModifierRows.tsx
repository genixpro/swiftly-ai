import type {DirectComparisonModifier} from '../../domain/directComparison';
import FieldDisplayEdit from './FieldDisplayEdit';

interface DirectComparisonModifierRowsProps {
    modifiers?: DirectComparisonModifier[];
    onChange(index: number, field: string, value: unknown): void;
    onCreate(field: string, value: unknown): void;
}

/** Existing direct-comparison adjustment rows, including the final add row. */
export default function DirectComparisonModifierRows({
    modifiers = [],
    onChange,
    onCreate,
}: DirectComparisonModifierRowsProps) {
    return <>
        {modifiers.map((modifier, index) => <tr className={'data-row modifier-row'} key={index}>
            <td className={'label-column'}>
                <span><FieldDisplayEdit
                    type={'text'}
                    placeholder={'Add/Remove'}
                    value={modifier.name}
                    onChange={(value) => onChange(index, 'name', value)}
                /></span>
            </td>
            <td className={'amount-column'} />
            <td className={'amount-total-column'}>
                <FieldDisplayEdit
                    hideIcon={true}
                    type={'currency'}
                    placeholder={'Amount ($)'}
                    value={modifier.amount}
                    onChange={(value) => onChange(index, 'amount', value)}
                />
            </td>
        </tr>)}
        <tr className={'data-row modifier-row'}>
            <td className={'label-column'}>
                <span><FieldDisplayEdit
                    type={'text'}
                    placeholder={'Add/Remove'}
                    onChange={(value) => onCreate('name', value)}
                /></span>
            </td>
            <td className={'amount-column'} />
            <td className={'amount-total-column'}>
                <FieldDisplayEdit
                    type={'currency'}
                    placeholder={'Amount ($)'}
                    hideIcon={true}
                    onChange={(value) => onCreate('amount', value)}
                />
            </td>
        </tr>
    </>;
}

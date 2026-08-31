import type {CapitalizationModifier} from '../../domain/capitalization';
import FieldDisplayEdit from './FieldDisplayEdit';

interface CapitalizationModifierRowsProps {
    modifiers?: CapitalizationModifier[];
    onChange(index: number, field: string, value: unknown): void;
    onCreate(field: string, value: unknown): void;
}

/** Existing capitalization adjustment rows, including the final add row. */
export default function CapitalizationModifierRows({
    modifiers = [],
    onChange,
    onCreate,
}: CapitalizationModifierRowsProps) {
    return <>
        {modifiers.map((modifier, index) => <tr className={'data-row modifier-row'} key={index}>
            <td className={'label-column'}>
                <span><FieldDisplayEdit
                    type={'text'}
                    placeholder={'Add/Remove ($)'}
                    value={modifier.name}
                    onChange={(value) => onChange(index, 'name', value)}
                /></span>
            </td>
            <td className={'amount-column'} />
            <td className={'amount-total-column'}>
                <FieldDisplayEdit
                    hideIcon={true}
                    type={'currency'}
                    placeholder={'Amount'}
                    value={modifier.amount}
                    onChange={(value) => onChange(index, 'amount', value)}
                />
            </td>
        </tr>)}
        <tr className={'data-row modifier-row'}>
            <td className={'label-column'}>
                <span><FieldDisplayEdit
                    type={'text'}
                    placeholder={'Add/Remove ($)'}
                    onChange={(value) => onCreate('name', value)}
                /></span>
            </td>
            <td className={'amount-column'} />
            <td className={'amount-total-column'}>
                <FieldDisplayEdit
                    type={'currency'}
                    placeholder={'Amount'}
                    hideIcon={true}
                    onChange={(value) => onCreate('amount', value)}
                />
            </td>
        </tr>
    </>;
}

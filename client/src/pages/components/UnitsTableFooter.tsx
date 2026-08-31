import {Button} from 'reactstrap';
import CurrencyFormat from './CurrencyFormat';
import IntegerFormat from './IntegerFormat';

interface UnitsTableFooterProps {
    allowNewUnit: boolean;
    allowSelection: boolean;
    averageRentPSF: number;
    onCreateUnit(): void;
    statsMode: 'all' | 'total';
    totalSize: number;
    totalStabilizedRent: number;
}

/** Static totals and creation footer kept separate from unit row interactions. */
export default function UnitsTableFooter({
    allowNewUnit,
    allowSelection,
    averageRentPSF,
    onCreateUnit,
    statsMode,
    totalSize,
    totalStabilizedRent,
}: UnitsTableFooterProps) {
    return <tfoot>
        {statsMode === 'total' || statsMode === 'all' ? <tr className={'first-total-row ' + (statsMode === 'total' ? 'last-total-row' : '')}>
            {allowSelection ? <td /> : null}
            <td className={'unit-number-column'} />
            <td className={'tenant-name-column'}><strong>Total</strong></td>
            <td className={'square-footage-column'}><IntegerFormat value={totalSize}/></td>
            <td className={'rent-column'}><CurrencyFormat value={averageRentPSF} cents={true} /></td>
            <td className={'rent-column'}><CurrencyFormat value={totalStabilizedRent} cents={false} /></td>
        </tr> : null}
        {allowNewUnit ? <tr className={'new-unit-row'}>
            <td colSpan={6}>
                <Button className={'new-unit-button'} color="secondary" onClick={onCreateUnit} title={'New Unit'}>
                    Create a New Unit
                </Button>
            </td>
        </tr> : null}
    </tfoot>;
}

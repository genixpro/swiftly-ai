import {Button, Card, CardBody} from 'reactstrap';
import FieldDisplayEdit from './FieldDisplayEdit';
import {
    retargetMarketRentUnit,
    toggleMarketRentUnit,
    updateMarketRentField,
} from '../../domain/marketRents';
import type {MarketRent as DomainMarketRent, MarketRentUnit as DomainMarketRentUnit} from '../../domain/marketRents';
import {currentTenancy} from '../../domain/appraisal';
import type {UnitDTO} from '../../api/types';

type MarketRent = DomainMarketRent;

interface MarketRentUnit extends DomainMarketRentUnit {
    unitNumber: string | number;
    tenancies: Array<{name: string}>;
    shouldApplyMarketRentDifferential?: boolean;
    shouldUseMarketRent?: boolean;
}

interface MarketRentEditorProps {
    appraisal: {units: MarketRentUnit[]};
    marketRent: MarketRent;
    onChange(marketRent: MarketRent): void;
    onDeleteMarketRent(marketRent: MarketRent): void;
}

function TenantApplicableEditor({unit, marketRent, onChange}: {
    unit: MarketRentUnit;
    marketRent: MarketRent;
    onChange(): void;
}) {
    const tenancy = currentTenancy(unit as unknown as UnitDTO)!;
    return <td className="value-column">
        <div>Unit {unit.unitNumber} - {tenancy.name}</div>
        <div><FieldDisplayEdit
            type="boolean"
            hideIcon
            value={unit.marketRent === marketRent.name}
            onChange={onChange}
            placeholder={`Does market rent apply to unit ${unit.unitNumber.toString()}`}
        /></div>
    </td>;
}

/** A single market-rent editor; parent owns collection and persistence state. */
export default function MarketRentEditor(props: MarketRentEditorProps) {
    const editor = {
        props,
        changeField: (field: string, newValue: unknown) => {
            const marketRent = props.marketRent;
            if (newValue !== marketRent[field]) {
                if (field === 'name') {
                    props.appraisal.units.forEach((unit) => {
                        const nextUnit = retargetMarketRentUnit(unit, marketRent.name, String(newValue));
                        if (nextUnit !== unit) unit.marketRent = nextUnit.marketRent ?? null;
                    });
                }
                Object.assign(marketRent, updateMarketRentField(marketRent, field, newValue));
                props.onChange(marketRent);
            }
        },
        changeUnitMarketRent: (unit: MarketRentUnit) => {
            const nextUnit = toggleMarketRentUnit(unit, props.marketRent.name);
            Object.assign(unit, nextUnit);
            props.onChange(props.marketRent);
        },
    };
    const {marketRent, appraisal} = props;

    return <Card className="market-rent-editor"><CardBody>
        <table className="market-rent-table"><tbody>
            <tr><td colSpan={2}>
                {marketRent.name !== 'Standard' ? <FieldDisplayEdit
                    type="text"
                    placeholder="Market Rent Name"
                    value={marketRent.name}
                    onChange={(newValue) => editor.changeField('name', newValue)}
                    hideInput={false}
                    hideIcon
                /> : <strong className="title">Default</strong>}
            </td></tr>
            <tr className="market-rent-row">
                <td className="label-column"><strong>Annual Rent (psf) </strong></td>
                <td className="value-column"><FieldDisplayEdit
                    type="currency"
                    value={marketRent.amountPSF}
                    hideInput={false}
                    hideIcon
                    onChange={(newValue) => editor.changeField('amountPSF', newValue)}
                /></td>
            </tr>
            <tr className="market-rent-row header-row">
                <td className="label-column"/><td className="value-column"/>
            </tr>
            <tr className="market-rent-row">
                <td className="label-column"><strong>Tenants Applied To</strong></td>
                {appraisal.units.length > 0 ? <TenantApplicableEditor
                    unit={appraisal.units[0]}
                    marketRent={marketRent}
                    onChange={() => editor.changeUnitMarketRent(appraisal.units[0])}
                /> : null}
            </tr>
            {appraisal.units.map((unit, unitIndex) => unitIndex === 0 ? null : <tr className="market-rent-row" key={unitIndex}>
                <td className="label-column"/>
                <TenantApplicableEditor unit={unit} marketRent={marketRent} onChange={() => editor.changeUnitMarketRent(unit)} />
            </tr>)}
            <tr className="market-rent-row total-spacer-row"><td className="label-column"/><td className="value-column"/></tr>
        </tbody></table>
        <Button color="danger" className="delete-button" onClick={() => props.onDeleteMarketRent(marketRent)}>Delete</Button>
    </CardBody></Card>;
}

import {Card, CardBody, Table} from 'reactstrap';
import FieldDisplayEdit from './FieldDisplayEdit';
import type {CapitalizationInputs, CapitalizationStatement} from '../../domain/capitalization';

interface CapitalizationInputsPanelProps {
    appraisal: {
        stabilizedStatementInputs?: CapitalizationInputs | null;
        stabilizedStatement: CapitalizationStatement;
    };
    onChange(field: string, value: unknown): void;
}

const adjustmentFields = [
    ['marketRentDifferential', 'Market Rent Differential', 'Apply Market Rent Differential', 'applyMarketRentDifferential'],
    ['vacantUnitLeasupCosts', 'Vacant Unit Leasing Costs', 'Apply Vacant Unit Leasing Costs', 'applyVacantUnitLeasingCosts'],
    ['vacantUnitRentLoss', 'Vacant Unit Rent Loss', 'Apply Vacant Unit Rent Loss', 'applyVacantUnitRentLoss'],
    ['freeRentRentLoss', 'Free Rent Loss', 'Apply Free Rent Loss', 'applyFreeRentLoss'],
    ['amortizedCapitalInvestment', 'Amortization Adjustment', 'Apply Amortization Adjustment', 'applyAmortization'],
] as const;

/** Capitalization inputs in their existing order; persistence remains in the page. */
export default function CapitalizationInputsPanel({appraisal, onChange}: CapitalizationInputsPanelProps) {
    const inputs = appraisal.stabilizedStatementInputs;
    const statement = appraisal.stabilizedStatement;
    return <Card className="capitalization-valuation-inputs" outline><CardBody>
        <h3>Inputs</h3>
        <Table><tbody>
            <tr />
            <tr>
                <td>Capitalization Rate</td>
                <td><FieldDisplayEdit
                    type="percent"
                    placeholder="Capitalization Rate"
                    value={inputs ? inputs.capitalizationRate : 5.0}
                    onChange={(value) => onChange('capitalizationRate', value)}
                /></td>
            </tr>
            {adjustmentFields.filter(([statementField]) => statement[statementField]).map(([, label, placeholder, inputField]) => <tr key={inputField}>
                <td>{label}</td>
                <td className="apply-adjustment-column"><FieldDisplayEdit
                    type="boolean"
                    placeholder={placeholder}
                    hideIcon
                    value={inputs ? inputs[inputField] : null}
                    onChange={(value) => onChange(inputField, value)}
                /></td>
            </tr>)}
        </tbody></Table>
    </CardBody></Card>;
}

import {Col} from 'reactstrap';
import CurrencyFormat from './CurrencyFormat';
import type {IncomeStatementEditorController} from './income-statement/types';

interface IncomeStatementStatsRowProps {
    editor: IncomeStatementEditorController;
    field: string;
    name: string;
    sizeOfBuilding: number;
}

/** A totals row that intentionally delegates all state and layout decisions to its editor. */
export default function IncomeStatementStatsRow({editor, field, name, sizeOfBuilding}: IncomeStatementStatsRowProps) {
    const {appraisal, field: statementField} = editor.props;
    const {state} = editor;
    const totals = state[field] as Record<string, number> | undefined;

    return <li className={"row expense-row total-row"}>
        {editor.renderHiddenHandleColumn()}
        <Col className={"name-column"}>
            <div className={"value-wrapper"}>{name}</div>
        </Col>
        {appraisal[statementField].years.map((year: number) => {
            if (state.pinnedYear !== null && year !== state.pinnedYear) {
                return null;
            }

            return [<Col key={year.toString() + "1"} className={"amount-column"}>
                <div className={"value-wrapper"}>
                    <CurrencyFormat value={totals ? totals[year] : null}/>
                </div>
            </Col>, sizeOfBuilding ? <Col key={year.toString() + "2"} className={"amount-column psf"}/> : null];
        })}
        {state.pinnedYear === null ? editor.renderHiddenActionColumn() : null}
    </li>;
}

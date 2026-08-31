import {Col, Row} from 'reactstrap';
import UnitsTable from './UnitsTable';
import type {AppraisalDTO, UnitDTO} from '../../api/types';

interface StabilizedStatementUnitsAppraisal extends AppraisalDTO {
    units: UnitDTO[];
}

interface StabilizedStatementUnitsSectionProps {
    appraisal: StabilizedStatementUnitsAppraisal;
    onChangeUnitOrder(newUnits: UnitDTO[]): void;
    onCreateUnit(unit: UnitDTO): void;
    onRemoveUnit(index: number): void;
    onUnitChanged(index: number, unit: UnitDTO): void;
    onUnitClicked(unit: UnitDTO, index: number): void;
}

/** Retains the original unit-table layout and event forwarding. */
function StabilizedStatementUnitsSection({
    appraisal,
    onChangeUnitOrder,
    onCreateUnit,
    onRemoveUnit,
    onUnitChanged,
    onUnitClicked,
}: StabilizedStatementUnitsSectionProps) {
    return <Row>
        <Col xs={12} lg={8}>
            <div className={"stabilized-statement-centered"}>
                <h3>Stabilized Income & Expense Statement</h3>
                <h4>{appraisal.address}</h4>
                <UnitsTable
                    appraisal={appraisal}
                    showStabilizedStats={true}
                    allowSelection={appraisal.appraisalType === 'simple'}
                    allowNewUnit={appraisal.appraisalType === 'simple'}
                    statsMode={"total"}
                    onUnitClicked={onUnitClicked}
                    onRemoveUnit={onRemoveUnit}
                    onCreateUnit={onCreateUnit}
                    onUnitChanged={onUnitChanged}
                    onChangeUnitOrder={onChangeUnitOrder}
                />
            </div>
        </Col>
    </Row>;
}

export default StabilizedStatementUnitsSection;

import { Row, Col, Card, CardBody, Button} from 'reactstrap';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import '@components/Common/datetime-compat.css'
import CurrencyFormat from "./components/CurrencyFormat";
import AreaFormat from "./components/AreaFormat";
import LeasingCostTenantRow from './components/LeasingCostTenantRow';
import {appraisalBuildingSize} from '../domain/appraisal';
import {
    createNumberedLeasingCostStructure,
    removeLeasingCostStructure,
    replaceLeasingCostStructure,
    retargetLeasingCostUnit,
    toggleLeasingCostUnit,
    toggleTreatAsVacant,
    updateLeasingCostField,
} from '../domain/leasingCosts';
import {confirmBrowserAction} from '../components/platform/browserActions';
import type {TenancyDTO} from '../api/types';
import type {LeasingCostStructure} from '../domain/leasingCosts';
import type {UnitCalculationAppraisal, UnitCalculationValues} from './components/unitCalculationTypes';

interface LeasingUnit extends UnitCalculationValues {
    tenancies: TenancyDTO[];
    squareFootage: number;
    unitNumber: string | number;
}
interface LeasingStructure extends LeasingCostStructure { name: string; }
interface LeasingAppraisal extends UnitCalculationAppraisal {
    leasingCosts: LeasingStructure[];
    stabilizedStatement: {
        vacantUnitLeasupCosts?: number | null;
        vacantUnitRentLoss?: number | null;
    };
    units: LeasingUnit[];
}
interface LeasingCostStructureEditorProps {
    appraisal: LeasingAppraisal;
    leasingCostStructure: LeasingStructure;
    onChange(structure: LeasingStructure): void;
    onDeleteLeasingStructure(structure: LeasingStructure): void;
}
interface ViewTenantLeasingCostsProps {
    appraisal: LeasingAppraisal;
    saveAppraisal(appraisal: LeasingAppraisal): void;
}


const TenantApplicableEditor = LeasingCostTenantRow;

function LeasingCostStructureEditor(props: LeasingCostStructureEditorProps)
{
    const editor = {
        props,
        changeField: (field: string, newValue: unknown) => {
            const leasingCostStructure = editor.props.leasingCostStructure;

        if (field === "name")
        {
            editor.props.appraisal.units.forEach((unit) =>
            {
                const nextUnit = retargetLeasingCostUnit(unit, leasingCostStructure.name, newValue);
                if (nextUnit !== unit) unit.leasingCostStructure = nextUnit.leasingCostStructure;
            });
        }

        if (newValue !== leasingCostStructure[field])
        {
            Object.assign(leasingCostStructure, updateLeasingCostField(leasingCostStructure, field, newValue));
            editor.props.onChange(leasingCostStructure);
        }
        },
        changeUnitLeasingCostStructure: (unit: LeasingUnit) => {
        const nextUnit = toggleLeasingCostUnit(unit, editor.props.leasingCostStructure.name);
        Object.assign(unit, nextUnit);
        editor.props.onChange(editor.props.leasingCostStructure);
        },
        onChangeTreatAsVacant: (unit: LeasingUnit) => {
        const nextUnit = toggleTreatAsVacant(unit);
        Object.assign(unit, nextUnit);
        editor.props.onChange(editor.props.leasingCostStructure);
        },
        computeTotalVacantUnitRentLoss: () => {
        let total = 0;
        editor.props.appraisal.units.forEach((unit) =>
        {
            if (unit.leasingCostStructure === editor.props.leasingCostStructure.name)
            {
                total += unit.calculatedVacantUnitRentLoss!;
            }
        });

        return total;
        },
        computeTotalVacantUnitLeasupCosts: () => {
        let total = 0;
        editor.props.appraisal.units.forEach((unit) =>
        {
            if (unit.leasingCostStructure === editor.props.leasingCostStructure.name)
            {
                total += unit.calculatedVacantUnitLeasupCosts!;
            }
        });

        return total;
        },
        computeTotalSize: () => {
        let total = 0;
        editor.props.appraisal.units.forEach((unit) =>
        {
            if (unit.leasingCostStructure === editor.props.leasingCostStructure.name)
            {
                total += unit.squareFootage;
            }
        });

        return total;
        },
    };
    const leasingCostStructure = editor.props.leasingCostStructure;

        return <Card className={"leasing-cost-structure-editor"}>
            <CardBody>
                <table className="leasing-cost-structure-table">
                    <tbody>
                    <tr>
                        <td colSpan={2}>
                            {
                                editor.props.leasingCostStructure.name !== "Standard" ?
                                    <FieldDisplayEdit
                                        type="text"
                                        placeholder="Leasing Cost Structure Name"
                                        value={leasingCostStructure.name}
                                        onChange={(newValue) => editor.changeField('name', newValue)}
                                        hideInput={false}
                                        hideIcon={true}

                                    /> : <strong className={"title"}>Standard Market Leasing Assumptions</strong>
                            }

                        </td>
                        <td className={"unit-size-column"} />
                        <td className={"calculated-vacant-unit-leasup-costs-column"} />
                        <td className={"calculated-vacant-unit-rent-loss"} />
                        <td className={"should-treat-unit-as-vacant-column"} />
                    </tr>
                    <tr className={"leasing-cost-row"}>
                        <td className={"label-column"}>
                            <strong>Tenant Inducements (psf)</strong>
                        </td>
                        <td className={"value-column"}>
                            <FieldDisplayEdit
                                type="currency"
                                value={leasingCostStructure.tenantInducementsPSF}
                                hideInput={false}
                                hideIcon={true}
                                onChange={(newValue) => editor.changeField('tenantInducementsPSF', newValue)}
                            />
                        </td>
                        <td className={"unit-size-column"} />
                        <td className={"calculated-vacant-unit-leasup-costs-column"} />
                        <td className={"calculated-vacant-unit-rent-loss"} />
                        <td className={"should-treat-unit-as-vacant-column"} />
                    </tr>
                    <tr className={"leasing-cost-row"}>
                        <td className={"label-column"}>
                            <strong>Leasing Commission</strong>
                        </td>
                        <td className={"value-column"}>
                            {
                                leasingCostStructure.leasingCommissionMode === 'psf' ?
                                    <FieldDisplayEdit
                                        type="currency"
                                        value={leasingCostStructure.leasingCommissionPSF}
                                        hideInput={false}
                                        hideIcon={true}
                                        onChange={(newValue) => editor.changeField('leasingCommissionPSF', newValue)}
                                    /> : null
                            }
                            <FieldDisplayEdit
                                type="leasingCommissionMode"
                                value={leasingCostStructure.leasingCommissionMode}
                                hideInput={false}
                                hideIcon={true}
                                onChange={(newValue) => editor.changeField('leasingCommissionMode', newValue)}
                            />
                        </td>
                        <td className={"unit-size-column"} />
                        <td className={"calculated-vacant-unit-leasup-costs-column"} />
                        <td className={"calculated-vacant-unit-rent-loss"} />
                        <td className={"should-treat-unit-as-vacant-column"} />
                    </tr>
                    {
                        leasingCostStructure.leasingCommissionMode === 'percent_of_rent' ?
                        <tr className={"leasing-cost-row"}>
                            <td className={"label-column"}>
                                <strong>Year 1</strong>
                            </td>
                            <td className={"value-column"}>
                                <FieldDisplayEdit
                                    type="percent"
                                    value={leasingCostStructure.leasingCommissionPercentYearOne}
                                    hideInput={false}
                                    hideIcon={true}
                                    onChange={(newValue) => editor.changeField('leasingCommissionPercentYearOne', newValue)}
                                />
                            </td>
                            <td className={"unit-size-column"} />
                            <td className={"calculated-vacant-unit-leasup-costs-column"} />
                            <td className={"calculated-vacant-unit-rent-loss"} />
                            <td className={"should-treat-unit-as-vacant-column"} />
                        </tr> : null
                    }
                    {
                        leasingCostStructure.leasingCommissionMode === 'percent_of_rent' ?
                            <tr className={"leasing-cost-row"}>
                                <td className={"label-column"}>
                                    <strong>Remaining Years</strong>
                                </td>
                                <td className={"value-column"}>
                                    {
                                        leasingCostStructure.leasingCommissionMode === 'percent_of_rent' ?
                                            <FieldDisplayEdit
                                                type="percent"
                                                value={leasingCostStructure.leasingCommissionPercentRemainingYears}
                                                hideInput={false}
                                                hideIcon={true}
                                                onChange={(newValue) => editor.changeField('leasingCommissionPercentRemainingYears', newValue)}
                                            /> : null
                                    }
                                </td>
                                <td className={"unit-size-column"}/>
                                <td className={"calculated-vacant-unit-leasup-costs-column"}/>
                                <td className={"calculated-vacant-unit-rent-loss"}/>
                                <td className={"should-treat-unit-as-vacant-column"}/>
                            </tr> : null
                    }
                    <tr className={"leasing-cost-row"}>
                        <td className={"label-column"}>
                            <strong>Lag Vacancy</strong>
                        </td>
                        <td className={"value-column"}>
                            <FieldDisplayEdit
                                type="months"
                                value={leasingCostStructure.renewalPeriod}
                                hideInput={false}
                                hideIcon={true}
                                onChange={(newValue) => editor.changeField('renewalPeriod', newValue)}
                            />
                        </td>
                        <td className={"unit-size-column"} />
                        <td className={"calculated-vacant-unit-leasup-costs-column"} />
                        <td className={"calculated-vacant-unit-rent-loss"} />
                        <td className={"should-treat-unit-as-vacant-column"} />
                    </tr>
                    <tr className={"leasing-cost-row"}>
                        <td className={"label-column"}>
                            <strong>Lease Term</strong>
                        </td>
                        <td className={"value-column"}>
                            <FieldDisplayEdit
                                type="months"
                                value={leasingCostStructure.leasingPeriod}
                                hideInput={false}
                                hideIcon={true}
                                onChange={(newValue) => editor.changeField('leasingPeriod', newValue)}
                            />
                        </td>
                        <td className={"unit-size-column"} />
                        <td className={"calculated-vacant-unit-leasup-costs-column"} />
                        <td className={"calculated-vacant-unit-rent-loss"} />
                        <td className={"should-treat-unit-as-vacant-column"} />
                    </tr>
                    <tr className={"leasing-cost-row header-row"}>
                        <td className={"label-column"} colSpan={5}>
                        </td>
                    </tr>
                    <tr className={"leasing-cost-row header-row"}>
                        <td className={"label-column"} colSpan={1}>
                            <strong className={"title"}>Leasing Costs</strong>
                        </td>
                        <td className={"value-column"}>
                            <strong>Apply Leasing Structure to Tenants:</strong>
                        </td>
                        <td className={"unit-size-column"}>
                            <strong>Unit Size (sqft)</strong>
                        </td>
                        <td className={"calculated-vacant-unit-leasup-costs-column"}>
                            <strong>Leasing Costs</strong>
                        </td>
                        <td className={"calculated-vacant-unit-rent-loss"}>
                            <strong>Gross Rent Loss</strong>
                        </td>
                        <td className={"should-treat-unit-as-vacant-column"} >
                            <strong>Vacant</strong>
                        </td>
                    </tr>
                    <tr className={"leasing-cost-row"}>
                        <td className={"label-column"}>
                            <strong>Tenants Applied To</strong>
                        </td>
                        {
                            editor.props.appraisal.units.length > 0 ?
                                <TenantApplicableEditor appraisal={editor.props.appraisal}
                                                        unit={editor.props.appraisal.units[0]} leasingCostStructure={leasingCostStructure}
                                                        onChange={() => editor.changeUnitLeasingCostStructure(editor.props.appraisal.units[0])}
                                                        onChangeTreatAsVacant={() => editor.onChangeTreatAsVacant(editor.props.appraisal.units[0])}

                                />
                                : null
                        }
                    </tr>
                    {
                        editor.props.appraisal.units.map((unit, unitIndex) =>
                        {
                            if (unitIndex === 0)
                            {
                                return null;
                            }

                            return <tr className={"leasing-cost-row"} key={unitIndex}>
                                <td className={"label-column"}/>
                                <TenantApplicableEditor appraisal={editor.props.appraisal}
                                                        unit={unit}
                                                        leasingCostStructure={leasingCostStructure}
                                                        onChange={() => editor.changeUnitLeasingCostStructure(unit)}
                                                        onChangeTreatAsVacant={() => editor.onChangeTreatAsVacant(unit)}
                                />
                            </tr>
                        })
                    }
                    <tr className={"leasing-cost-row total-spacer-row"}>
                        <td className={"label-column"} />
                        <td className={"value-column"} />
                        <td className={"unit-size-column"} />
                        <td className={"calculated-vacant-unit-leasup-costs-column"} />
                        <td className={"calculated-vacant-unit-rent-loss"} />
                        <td className={"should-treat-unit-as-vacant-column"} />
                    </tr>
                    <tr className={"leasing-cost-row total-row"}>
                        <td className={"label-column"}>

                        </td>
                        <td className={"value-column"}>
                            <strong>Totals for Leasing<br/> Cost Structure</strong>
                        </td>
                        <td className={"unit-size-column"}>
                            <AreaFormat value={editor.computeTotalSize()}/>
                        </td>
                        <td className={"calculated-vacant-unit-leasup-costs-column"}>
                            <CurrencyFormat value={editor.computeTotalVacantUnitLeasupCosts()}/>
                        </td>
                        <td className={"calculated-vacant-unit-rent-loss"}>
                            <CurrencyFormat value={editor.computeTotalVacantUnitRentLoss()}/>
                        </td>
                        <td className={"should-treat-unit-as-vacant-column"} >
                        </td>
                    </tr>
                    </tbody>
                </table>

                {
                    editor.props.leasingCostStructure.name !== "Standard" ?
                        <Button color={"danger"} className={"delete-button"} onClick={() => editor.props.onDeleteLeasingStructure(editor.props.leasingCostStructure)}>Delete</Button>
                        : null
                }
            </CardBody>
        </Card>
}


const defaultLeasingCostStructureData = {
    name: "New Leasing Structure",
    leasingCommissionPSF: 0,
    tenantInducementsPSF: 0,
    renewalPeriod: 0,
    leasingPeriod: 0
};

function ViewTenantsLeasingCosts(props: ViewTenantLeasingCostsProps)
{
    const sizeOfBuilding = appraisalBuildingSize(props.appraisal as never);
    const onLeasingStructureChanged = (leasingCosts: LeasingStructure, leasingCostsIndex: number) => {
        props.appraisal.leasingCosts = replaceLeasingCostStructure(
            props.appraisal.leasingCosts,
            leasingCostsIndex,
            leasingCosts,
        ) as LeasingStructure[];
        props.saveAppraisal(props.appraisal);
    };
    const onNewLeasingStructure = () => {
        const newLeasingCosts = createNumberedLeasingCostStructure(defaultLeasingCostStructureData, props.appraisal.leasingCosts.length);
        props.appraisal.leasingCosts = [...props.appraisal.leasingCosts, newLeasingCosts as LeasingStructure];
        props.saveAppraisal(props.appraisal);
    };
    const onDeleteLeasingStructure = (leasingCostsIndex: number) => {
        if (confirmBrowserAction("Are you sure you want to delete the leasing cost structure?"))
        {
            const changes = removeLeasingCostStructure(props.appraisal.leasingCosts, props.appraisal.units, leasingCostsIndex);
            props.appraisal.leasingCosts = changes.structures as LeasingStructure[];
            props.appraisal.units.forEach((unit, unitIndex) => {
                if (changes.units[unitIndex] !== unit) unit.leasingCostStructure = changes.units[unitIndex].leasingCostStructure;
            });

            props.saveAppraisal(props.appraisal);
        }
    };
        return (
            (props.appraisal) ?
                <div id={"view-leasing-cost-structures"} className={"view-leasing-cost-structures"}>
                    <h2>Market Leasing Assumptions</h2>

                    <Row>
                        <Col>
                            <div className={"leasing-cost-structures-list"}>
                                {
                                    props.appraisal.leasingCosts.map((leasingCostStructure, leasingCostStructureIndex) =>
                                    {
                                        return <LeasingCostStructureEditor
                                            key={leasingCostStructureIndex}
                                            leasingCostStructure={leasingCostStructure}
                                            appraisal={props.appraisal}
                                            onChange={(newValue: LeasingStructure) => onLeasingStructureChanged(newValue, leasingCostStructureIndex)}
                                            onDeleteLeasingStructure={() => onDeleteLeasingStructure(leasingCostStructureIndex)}
                                        />
                                    })
                                }
                                {
                                    props.appraisal.leasingCosts.length > 1 ?
                                        <Card className={"leasing-cost-structure-editor"}>
                                            <CardBody>
                                                <table className="leasing-cost-structure-table">
                                                    <tbody>
                                                    <tr className={"total-row"}>
                                                        <td className={"label-column"}>

                                                        </td>
                                                        <td className={"value-column"}>
                                                            <strong>Grand Totals</strong>
                                                        </td>
                                                        <td className={"unit-size-column"}>
                                                            <AreaFormat value={sizeOfBuilding}/>
                                                        </td>
                                                        <td className={"calculated-vacant-unit-leasup-costs-column"}>
                                                            <CurrencyFormat value={props.appraisal.stabilizedStatement.vacantUnitLeasupCosts}/>
                                                        </td>
                                                        <td className={"calculated-vacant-unit-rent-loss"}>
                                                            <CurrencyFormat value={props.appraisal.stabilizedStatement.vacantUnitRentLoss}/>
                                                        </td>
                                                        <td className={"should-treat-unit-as-vacant-column"} >
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </CardBody>
                                        </Card> : null
                                }
                                {
                                    <div className={"new-leasing-cost-structure"}>
                                        <Button onClick={onNewLeasingStructure}>
                                            <span>Create a new leasing cost structure</span>
                                        </Button>
                                    </div>
                                }
                            </div>
                        </Col>
                    </Row>
                </div>
                : null
        );
}

export {LeasingCostStructureEditor};
export default ViewTenantsLeasingCosts;

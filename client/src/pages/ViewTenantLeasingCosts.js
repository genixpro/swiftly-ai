import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Button, Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import 'react-datetime/css/react-datetime.css'
import LeasingCostStructureModel from "../models/LeasingCostStructureModel";
import CurrencyFormat from "./components/CurrencyFormat";
import AreaFormat from "./components/AreaFormat";
import PercentFormat from "./components/PercentFormat";
import IntegerFormat from "./components/IntegerFormat";
import LeasingCostsForUnitCalculationPopoverWrapper from "./components/LeasingCostsForUnitCalculationPopoverWrapper";
import VacantRentLossForUnitCalculationPopoverWrapper from "./components/VacantRentLossForUnitCalculationPopoverWrapper";



class TenantApplicableEditor extends React.Component
{
    state = {};

    render()
    {
        return [<td className={"value-column"} key={1}>
                <div>Unit {this.props.unit.unitNumber} - {this.props.unit.currentTenancy.name}</div>
                <div>
                    <FieldDisplayEdit
                        type={"boolean"}
                        hideIcon={true}
                        value={this.props.unit.leasingCostStructure === this.props.leasingCostStructure.name}
                        edit={!this.props.leasingCostStructure.isDefault}
                        onChange={() => this.props.onChange()}
                        placeholder={"Does leasing cost structure apply to unit " + this.props.unit.unitNumber.toString()}
                    />
                </div>
            </td>,
            <td className={"unit-size-column"} key={2}>
                <AreaFormat value={this.props.unit.squareFootage} />
            </td>,
            <td className={"calculated-vacant-unit-leasup-costs-column"} key={3}>
                <LeasingCostsForUnitCalculationPopoverWrapper appraisal={this.props.appraisal} unit={this.props.unit}>
                    {
                        this.props.unit.leasingCostStructure === this.props.leasingCostStructure.name && this.props.unit.isVacantForStabilizedStatement
                        && this.props.unit.calculatedVacantUnitLeasupCosts ?
                            <CurrencyFormat value={this.props.unit.calculatedVacantUnitLeasupCosts}/> : null
                    }
                </LeasingCostsForUnitCalculationPopoverWrapper>
            </td>,
            <td className={"calculated-vacant-unit-rent-loss"} key={4}>
                <VacantRentLossForUnitCalculationPopoverWrapper appraisal={this.props.appraisal} unit={this.props.unit}>
                    {
                        this.props.unit.leasingCostStructure === this.props.leasingCostStructure.name && this.props.unit.isVacantForStabilizedStatement ?
                            this.props.unit.marketRent ?
                                this.props.unit.calculatedVacantUnitRentLoss ?
                                    <CurrencyFormat value={this.props.unit.calculatedVacantUnitRentLoss}/>
                                    : null
                                : <span className={"none-found"}>no market rent</span>
                            : null
                    }
                </VacantRentLossForUnitCalculationPopoverWrapper>
            </td>,
            <td className={"should-treat-unit-as-vacant-column"} key={5}>
                {this.props.unit.leasingCostStructure === this.props.leasingCostStructure.name ?
                    <FieldDisplayEdit
                        type={"boolean"}
                        hideIcon={true}
                        value={this.props.unit.isVacantForStabilizedStatement}
                        onChange={() => this.props.onChangeTreatAsVacant()}
                        placeholder={"Should the unit " + this.props.unit.unitNumber.toString() + " be considered vacant when calculating the valuation."}
                    /> : null}
            </td>
        ]
    }
}

class LeasingCostStructureEditor extends React.Component
{
    changeField(field, newValue)
    {
        const leasingCostStructure = this.props.leasingCostStructure;

        if (field === "name")
        {
            // Go through the appraisal units and update any which are attached to this rent name
            this.props.appraisal.units.forEach((unit) =>
            {
                if (unit.leasingCostStructure === leasingCostStructure.name)
                {
                    unit.leasingCostStructure = newValue;
                }
            });
        }

        if (newValue !== leasingCostStructure[field])
        {
            leasingCostStructure[field] = newValue;
            this.props.onChange(leasingCostStructure);
        }
    }

    changeUnitLeasingCostStructure(unit)
    {
        if (unit.leasingCostStructure === this.props.leasingCostStructure.name)
        {
            unit.leasingCostStructure = "Standard";
        }
        else
        {
            unit.leasingCostStructure = this.props.leasingCostStructure.name;
        }
        unit.resetCalculations();
        this.props.onChange(this.props.leasingCostStructure);
    }

    onChangeTreatAsVacant(unit)
    {
        unit.shouldTreatAsVacant = !unit.isVacantForStabilizedStatement;
        unit.resetCalculations();
        this.props.onChange(this.props.leasingCostStructure);
    }

    computeTotalVacantUnitRentLoss()
    {
        let total = 0;
        this.props.appraisal.units.forEach((unit) =>
        {
            if (unit.leasingCostStructure === this.props.leasingCostStructure.name)
            {
                total += unit.calculatedVacantUnitRentLoss;
            }
        });

        return total;
    }

    computeTotalVacantUnitLeasupCosts()
    {
        let total = 0;
        this.props.appraisal.units.forEach((unit) =>
        {
            if (unit.leasingCostStructure === this.props.leasingCostStructure.name)
            {
                total += unit.calculatedVacantUnitLeasupCosts;
            }
        });

        return total;
    }

    computeTotalSize()
    {
        let total = 0;
        this.props.appraisal.units.forEach((unit) =>
        {
            if (unit.leasingCostStructure === this.props.leasingCostStructure.name)
            {
                total += unit.squareFootage;
            }
        });

        return total;
    }

    render()
    {
        const leasingCostStructure = this.props.leasingCostStructure;

        return <Card className={"leasing-cost-structure-editor"}>
            <CardBody>
                <table className="leasing-cost-structure-table">
                    <tbody>
                    <tr>
                        <td colSpan={2}>
                            {
                                this.props.leasingCostStructure.name !== "Standard" ?
                                    <FieldDisplayEdit
                                        type="text"
                                        placeholder="Leasing Cost Structure Name"
                                        value={leasingCostStructure.name}
                                        onChange={(newValue) => this.changeField('name', newValue)}
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
                                onChange={(newValue) => this.changeField('tenantInducementsPSF', newValue)}
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
                                        onChange={(newValue) => this.changeField('leasingCommissionPSF', newValue)}
                                    /> : null
                            }
                            <FieldDisplayEdit
                                type="leasingCommissionMode"
                                value={leasingCostStructure.leasingCommissionMode}
                                hideInput={false}
                                hideIcon={true}
                                onChange={(newValue) => this.changeField('leasingCommissionMode', newValue)}
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
                                    onChange={(newValue) => this.changeField('leasingCommissionPercentYearOne', newValue)}
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
                                                onChange={(newValue) => this.changeField('leasingCommissionPercentRemainingYears', newValue)}
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
                                onChange={(newValue) => this.changeField('renewalPeriod', newValue)}
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
                                onChange={(newValue) => this.changeField('leasingPeriod', newValue)}
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
                            this.props.appraisal.units.length > 0 ?
                                <TenantApplicableEditor appraisal={this.props.appraisal}
                                                        unit={this.props.appraisal.units[0]} leasingCostStructure={leasingCostStructure}
                                                        onChange={() => this.changeUnitLeasingCostStructure(this.props.appraisal.units[0])}
                                                        onChangeTreatAsVacant={() => this.onChangeTreatAsVacant(this.props.appraisal.units[0])}

                                />
                                : null
                        }
                    </tr>
                    {
                        this.props.appraisal.units.map((unit, unitIndex) =>
                        {
                            if (unitIndex === 0)
                            {
                                return null;
                            }

                            return <tr className={"leasing-cost-row"} key={unitIndex}>
                                <td className={"label-column"}/>
                                <TenantApplicableEditor appraisal={this.props.appraisal}
                                                        unit={unit}
                                                        leasingCostStructure={leasingCostStructure}
                                                        onChange={() => this.changeUnitLeasingCostStructure(unit)}
                                                        onChangeTreatAsVacant={() => this.onChangeTreatAsVacant(unit)}
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
                            <AreaFormat value={this.computeTotalSize()}/>
                        </td>
                        <td className={"calculated-vacant-unit-leasup-costs-column"}>
                            <CurrencyFormat value={this.computeTotalVacantUnitLeasupCosts()}/>
                        </td>
                        <td className={"calculated-vacant-unit-rent-loss"}>
                            <CurrencyFormat value={this.computeTotalVacantUnitRentLoss()}/>
                        </td>
                        <td className={"should-treat-unit-as-vacant-column"} >
                        </td>
                    </tr>
                    </tbody>
                </table>

                {
                    this.props.leasingCostStructure.name !== "Standard" ?
                        <Button color={"danger"} className={"delete-button"} onClick={() => this.props.onDeleteLeasingStructure(this.props.leasingCostStructure)}>Delete</Button>
                        : null
                }
            </CardBody>
        </Card>
    }
}


class ViewTenantsLeasingCosts extends React.Component
{
    state = {

    };

    defaultLeasingCostStructureData = {
        name: "New Leasing Structure",
        leasingCommissionPSF: 0,
        tenantInducementsPSF: 0,
        renewalPeriod: 0,
        leasingPeriod: 0
    };

    componentDidMount()
    {

    }

    onLeasingStructureChanged(leasingCosts, leasingCostsIndex)
    {
        this.props.appraisal.leasingCosts[leasingCostsIndex] = leasingCosts;
        this.props.saveAppraisal(this.props.appraisal);
    }

    onNewLeasingStructure(newLeasingCosts)
    {
        newLeasingCosts.name = newLeasingCosts.name + " " + this.props.appraisal.leasingCosts.length.toString();
        this.props.appraisal.leasingCosts.push(newLeasingCosts);
        this.props.saveAppraisal(this.props.appraisal);
    }

    onDeleteLeasingStructure(leasingCostsIndex)
    {
        if (window.confirm("Are you sure you want to delete the leasing cost structure?"))
        {
            const leasingCostStructure = this.props.appraisal.leasingCosts[leasingCostsIndex];
            this.props.appraisal.leasingCosts.splice(leasingCostsIndex, 1);

            // Go through the appraisal units and update any which are attached to this rent name
            this.props.appraisal.units.forEach((unit) =>
            {
                if (unit.leasingCostStructure === leasingCostStructure.name)
                {
                    unit.leasingCostStructure = "Standard";
                }
            });

            this.props.saveAppraisal(this.props.appraisal);
        }
    }

    render() {
        return (
            (this.props.appraisal) ?
                <div id={"view-leasing-cost-structures"} className={"view-leasing-cost-structures"}>
                    <h2>Market Leasing Assumptions</h2>

                    <Row>
                        <Col>
                            <div className={"leasing-cost-structures-list"}>
                                {
                                    this.props.appraisal.leasingCosts.map((leasingCostStructure, leasingCostStructureIndex) =>
                                    {
                                        return <LeasingCostStructureEditor
                                            key={leasingCostStructureIndex}
                                            leasingCostStructure={leasingCostStructure}
                                            appraisal={this.props.appraisal}
                                            onChange={(newValue) => this.onLeasingStructureChanged(newValue, leasingCostStructureIndex)}
                                            onDeleteLeasingStructure={() => this.onDeleteLeasingStructure(leasingCostStructureIndex)}
                                        />
                                    })
                                }
                                {
                                    this.props.appraisal.leasingCosts.length > 1 ?
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
                                                            <AreaFormat value={this.props.appraisal.sizeOfBuilding}/>
                                                        </td>
                                                        <td className={"calculated-vacant-unit-leasup-costs-column"}>
                                                            <CurrencyFormat value={this.props.appraisal.stabilizedStatement.vacantUnitLeasupCosts}/>
                                                        </td>
                                                        <td className={"calculated-vacant-unit-rent-loss"}>
                                                            <CurrencyFormat value={this.props.appraisal.stabilizedStatement.vacantUnitRentLoss}/>
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
                                        <Button onClick={() => this.onNewLeasingStructure(LeasingCostStructureModel.create(this.defaultLeasingCostStructureData, this.props.appraisal, 'leasingCosts'))}>
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
}

export default ViewTenantsLeasingCosts;

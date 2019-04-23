import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Button} from 'reactstrap';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import 'react-datetime/css/react-datetime.css'
import LeasingCostStructureModel from "../models/LeasingCostStructureModel";



class TenantApplicableEditor extends React.Component
{
    render()
    {
        return [<td className={"value-column"}>
                <div>Unit {this.props.unit.unitNumber}</div>
                <div>
                    <FieldDisplayEdit
                        type={"boolean"}
                        hideIcon={true}
                        value={this.props.unit.leasingCostStructure === this.props.leasingCostStructure.name}
                        onChange={() => this.props.onChange()}
                        placeholder={"Does recovery structure apply to unit " + this.props.unit.unitNumber.toString()}
                    />
                </div>
            </td>]
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
            unit.leasingCostStructure = "Default";
        }
        else
        {
            unit.leasingCostStructure = this.props.leasingCostStructure.name;
        }
        this.props.onChange(this.props.leasingCostStructure);
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
                                this.props.leasingCostStructure.name !== "Default" ?
                                    <FieldDisplayEdit
                                        type="text"
                                        placeholder="Leasing Cost Structure Name"
                                        value={leasingCostStructure.name}
                                        onChange={(newValue) => this.changeField('name', newValue)}
                                        hideInput={false}
                                        hideIcon={true}

                                    /> : <strong className={"title"}>Default</strong>
                            }

                        </td>
                    </tr>
                    <tr className={"leasing-cost-row"}>
                        <td className={"label-column"}>
                            <strong>Tenant Inducments (psf)</strong>
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
                    </tr>
                    <tr className={"leasing-cost-row"}>
                        <td className={"label-column"}>
                            <strong>Leasing Commission (psf)</strong>
                        </td>
                        <td className={"value-column"}>
                            <FieldDisplayEdit
                                type="currency"
                                value={leasingCostStructure.leasingCommissionPSF}
                                hideInput={false}
                                hideIcon={true}
                                onChange={(newValue) => this.changeField('leasingCommissionPSF', newValue)}
                            />
                        </td>
                    </tr>
                    <tr className={"leasing-cost-row"}>
                        <td className={"label-column"}>
                            <strong>Renewal Period</strong>
                        </td>
                        <td className={"value-column"}>
                            <FieldDisplayEdit
                                type="currency"
                                value={leasingCostStructure.renewalPeriod}
                                hideInput={false}
                                hideIcon={true}
                                onChange={(newValue) => this.changeField('renewalPeriod', newValue)}
                            />
                        </td>
                    </tr>
                    <tr className={"leasing-cost-row"}>
                        <td className={"label-column"}>
                            <strong>Leasing Period</strong>
                        </td>
                        <td className={"value-column"}>
                            <FieldDisplayEdit
                                type="currency"
                                value={leasingCostStructure.leasingPeriod}
                                hideInput={false}
                                hideIcon={true}
                                onChange={(newValue) => this.changeField('leasingPeriod', newValue)}
                            />
                        </td>
                    </tr>
                    {
                        leasingCostStructure.name !== "Default" ? [
                            <tr className={"leasing-cost-row"}>
                                <td className={"label-column"}>
                                    <strong>Tenants Applied To</strong>
                                </td>
                                {
                                    this.props.appraisal.units.length > 0 ?
                                        <TenantApplicableEditor unit={this.props.appraisal.units[0]} leasingCostStructure={leasingCostStructure}
                                                                onChange={() => this.changeUnitLeasingCostStructure(this.props.appraisal.units[0])}/>
                                        : null
                                }
                            </tr>,
                            this.props.appraisal.units.map((unit, unitIndex) =>
                            {
                                if (unitIndex === 0)
                                {
                                    return null;
                                }

                                return <tr className={"leasing-cost-row"} key={unitIndex}>
                                    <td className={"label-column"}/>
                                    <TenantApplicableEditor unit={unit} leasingCostStructure={leasingCostStructure}
                                                            onChange={() => this.changeUnitLeasingCostStructure(unit)}/>
                                </tr>
                            })
                        ] : null
                    }
                    </tbody>
                </table>

                {
                    this.props.leasingCostStructure.name !== "Default" ?
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
        this.props.appraisal.leasingCosts.push(newLeasingCosts);
        this.props.saveAppraisal(this.props.appraisal);
    }

    onDeleteLeasingStructure(leasingCostsIndex)
    {
        const leasingCostStructure = this.props.appraisal.leasingCosts[leasingCostsIndex];
        this.props.appraisal.leasingCosts.splice(leasingCostsIndex, 1);

        // Go through the appraisal units and update any which are attached to this rent name
        this.props.appraisal.units.forEach((unit) =>
        {
            if (unit.leasingCostStructure === leasingCostStructure.name)
            {
                unit.leasingCostStructure = "Default";
            }
        });

        this.props.saveAppraisal(this.props.appraisal);
    }

    render() {
        return (
            (this.props.appraisal) ?
                <div id={"view-leasing-cost-structures"} className={"view-leasing-cost-structures"}>
                    <h2>Leasing Cost Structures</h2>

                    <Row>
                        <Col>
                            <div className={"leasing-cost-structures-list"}>
                                {
                                    this.props.appraisal.leasingCosts.map((leasingCostStructure, leasingCostStructureIndex) =>
                                    {
                                        return <LeasingCostStructureEditor
                                            leasingCostStructure={leasingCostStructure}
                                            appraisal={this.props.appraisal}
                                            onChange={(newValue) => this.onLeasingStructureChanged(newValue, leasingCostStructureIndex)}
                                            onDeleteLeasingStructure={() => this.onDeleteLeasingStructure(leasingCostStructureIndex)}
                                        />
                                    })
                                }
                                {
                                    <div className={"new-leasing-cost-structure"}>
                                        <Button onClick={() => this.onNewLeasingStructure(new LeasingCostStructureModel(this.defaultLeasingCostStructureData))}>
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

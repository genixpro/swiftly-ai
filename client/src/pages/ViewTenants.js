import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table } from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import _ from 'underscore';
import Moment from 'react-moment';
import {DAEModel} from 'react-3d-viewer';


class ViewTenants extends React.Component
{
    state = {
        capitalizationRate: 8.4,
        selectedUnit: null
    };

    componentDidMount()
    {
        axios.get(`/appraisal/${this.props.match.params.id}`).then((response) =>
        {
            this.setState({appraisal: response.data.appraisal})
        });
    }

    onTenantClicked(unitNum)
    {
        this.state.appraisal.units.forEach((unit) =>
        {
            if (unit.unitNumber === unitNum)
            {
                this.setState({selectedUnit: unit})
            }
        });
    }

    renderUnitRow(unitInfo)
    {
        let selectedClass = "";
        if (this.state.selectedUnit && unitInfo.unitNumber === this.state.selectedUnit.unitNumber)
        {
            selectedClass = " selected-tenant-row";
        }

        return <tr onClick={(evt) => this.onTenantClicked(unitInfo.unitNumber)} className={"tenant-row " + selectedClass}>
            <td>{unitInfo.unitNumber}</td>
            <td>{unitInfo.floorNumber}</td>

            <td>{unitInfo.currentTenancy.name}</td>
            <td>
                {unitInfo.currentTenancy.startDate && <Moment format="YYYY/MM/DD">{new Date(unitInfo.currentTenancy.startDate.$date).toISOString()}</Moment>}
            </td>
            <td>
                {unitInfo.currentTenancy.endDate && <Moment format="YYYY/MM/DD">{new Date(unitInfo.currentTenancy.endDate.$date).toISOString()}</Moment>}
            </td>
            <td>$<NumberFormat
                value={unitInfo.currentTenancy.monthlyRent}
                displayType={'text'}
                thousandSeparator={', '}
                decimalScale={2}
                fixedDecimalScale={true}
            /></td>
        </tr>;
    }

    renderTenancy(unitInfo, tenantInfo)
    {
        return <tr onClick={(evt) => this.onTenantClicked(unitInfo.unitNumber)} className={"tenant-row"}>
            <td></td>
            <td></td>
            <td>{tenantInfo.name}</td>
            <td>
                {tenantInfo.startDate && <Moment format="YYYY/MM/DD">{new Date(tenantInfo.startDate.$date).toISOString()}</Moment>}
            </td>
            <td>
                {tenantInfo.endDate && <Moment format="YYYY/MM/DD">{new Date(tenantInfo.endDate.$date).toISOString()}</Moment>}
            </td>
            <td>$<NumberFormat
                value={tenantInfo.monthlyRent}
                displayType={'text'}
                thousandSeparator={', '}
                decimalScale={2}
                fixedDecimalScale={true}
            /></td>
        </tr>;
    }


    render() {
        return (
            (this.state.appraisal) ?
                <div id={"view-tenants"} className={"view-tenants"}>
                    <Row>
                        <Col xs={4} md={4} lg={4} xl={4}>
                            <Card outline color="primary" className="mb-3">
                                <CardHeader className="text-white bg-primary">Tenants</CardHeader>
                                <CardBody>
                                    <Table hover responsive>
                                        <thead>
                                            <tr>
                                                <td>Unit Number</td>
                                                <td>Floor</td>
                                                <td>Tenant Name</td>
                                                <td>Term Start</td>
                                                <td>Term End</td>
                                                <td>Monthly Rent</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            this.state.appraisal && this.state.appraisal.units && Object.values(this.state.appraisal.units).map((unit) => {
                                                return this.renderUnitRow(unit);
                                            })
                                        }
                                        </tbody>
                                    </Table>
                                </CardBody>
                            </Card>
                        </Col>
                        {
                            this.state.selectedUnit ?
                                <Col xs={8} md={8} lg={8} xl={8}>
                                    <Card outline color="primary" className="mb-3">
                                        <CardHeader className="text-white bg-primary">Tenant Information</CardHeader>
                                        <CardBody>

                                            <p>Unit Number {this.state.selectedUnit.unitNumber}</p>
                                            <p>Floor Number {this.state.selectedUnit.floorNumber}</p>

                                            <DAEModel src={axios.defaults.baseURL + `appraisal/${this.props.match.params.id}/building`} texPath=""/>
                                        </CardBody>
                                    </Card>
                                </Col> : null
                        }
                    </Row>
                </div>
                : null
        );
    }
}

export default ViewTenants;

import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table } from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import _ from 'underscore';
import Moment from 'react-moment';


class ViewTenants extends React.Component
{
    state = {
        capitalizationRate: 8.4,
        expandedTenants: {}
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
        if (this.state.expandedTenants[unitNum])
        {
            this.state.expandedTenants[unitNum] = false;
            this.setState({expandedTenants: this.state.expandedTenants});
        }
        else
        {
            this.state.expandedTenants[unitNum] = true;
            this.setState({expandedTenants: this.state.expandedTenants});
        }
    }

    renderUnitRow(unitInfo)
    {
        return <tr onClick={(evt) => this.onTenantClicked(unitInfo.unitNumber)} className={"tenant-row"}>
            <td>{unitInfo.unitNumber}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>;
    }

    renderTenancy(unitInfo, tenantInfo)
    {
        return <tr onClick={(evt) => this.onTenantClicked(unitInfo.unitNumber)} className={"tenant-row"}>
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
                        <Col xs={12} md={12} lg={12} xl={12}>
                            <Card outline color="primary" className="mb-3">
                                <CardHeader className="text-white bg-primary">Tenants</CardHeader>
                                <CardBody>
                                    <Table hover responsive>
                                        <thead>
                                            <tr>
                                                <td>Unit Number</td>
                                                <td>Tenant Name</td>
                                                <td>Term Start</td>
                                                <td>Term End</td>
                                                <td>Monthly Rent</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            this.state.appraisal && this.state.appraisal.units && Object.values(this.state.appraisal.units).map((unit) => {
                                                if (this.state.expandedTenants[unit.unitNumber])
                                                {
                                                    return[
                                                            this.renderUnitRow(unit),
                                                            unit.tenancies.map((tenantInfo) =>
                                                            {
                                                                return this.renderTenancy(unit, tenantInfo);
                                                            })
                                                        ];
                                                }
                                                else
                                                {
                                                    return this.renderUnitRow(unit);
                                                }
                                            })
                                        }
                                        </tbody>
                                    </Table>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>
                : null
        );
    }
}

export default ViewTenants;

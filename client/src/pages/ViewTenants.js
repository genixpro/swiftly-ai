import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table } from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import _ from 'underscore';



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
            this.setState({appraisal: response.data.appraisal}, () => this.groupTenants())
        });
    }


    groupTenants()
    {
        const tenantsByUnit = _.groupBy(this.state.appraisal.rentRoll, (tenant) => tenant.UNIT_NUM);

        this.setState({"tenants": tenantsByUnit})
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

    renderTenantRow(tenantInfo, showIdentifyingInfo)
    {
        return <tr onClick={(evt) => this.onTenantClicked(tenantInfo.UNIT_NUM)} className={"tenant-row"}>
            <td>{showIdentifyingInfo ? tenantInfo.UNIT_NUM : ""}</td>
            <td>{showIdentifyingInfo ? tenantInfo.TENANT_NAME : ""}</td>
            <td>{tenantInfo.TERM}</td>
            <td>$<NumberFormat
                value={tenantInfo.MONTHLY_RENT}
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
                                                <td>Term</td>
                                                <td>Monthly Rent</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            this.state.tenants && Object.values(this.state.tenants).map((tenant) => {
                                                if (this.state.expandedTenants[tenant[0].UNIT_NUM])
                                                {
                                                    return tenant.map((tenantInfo, index) =>
                                                    {
                                                        return this.renderTenantRow(tenantInfo, index === 0);
                                                    });
                                                }
                                                else
                                                {
                                                    return this.renderTenantRow(tenant[0], true);
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

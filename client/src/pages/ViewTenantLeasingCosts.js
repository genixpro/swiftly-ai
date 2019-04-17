import React from 'react';
import { Row, Col } from 'reactstrap';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import 'react-datetime/css/react-datetime.css'

class ViewTenantsLeasingCosts extends React.Component
{
    state = {
        capitalizationRate: 8.4,
        selectedUnit: null
    };

    changeDCFInput(field, newValue)
    {
        this.props.appraisal.discountedCashFlowInputs[field] = newValue;
        this.props.saveAppraisal(this.props.appraisal);
    }


    render() {
        return (
            (this.props.appraisal) ?
                <div id={"view-tenants"} className={"view-tenants"}>
                    <Row>
                        <Col xs={12}>
                            <h3>View Leasing Costs</h3>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} sm={6} md={4}>
                            <table className="table">
                                <tbody>
                                <tr>
                                    <td>
                                        <strong>Leasing Commission Costs (Per Lease)</strong>
                                    </td>
                                    <td>
                                        <FieldDisplayEdit type={"currency"} value={this.props.appraisal.discountedCashFlowInputs.leasingCommission} onChange={(newValue) => this.changeDCFInput('leasingCommission', newValue)}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <strong>Tenant Inducement Costs (Per Square Foot)</strong>
                                    </td>
                                    <td>
                                        <FieldDisplayEdit type={"currency"} value={this.props.appraisal.discountedCashFlowInputs.tenantInducementsPSF} onChange={(newValue) => this.changeDCFInput('tenantInducementsPSF', newValue)}/>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </Col>
                        <Col xs={12} sm={6} md={4}>
                            <table className="table">
                                <tbody>
                                <tr>
                                    <td>
                                        <strong>Leasing Period (Months)</strong>
                                    </td>
                                    <td>
                                        <FieldDisplayEdit type={"number"} value={this.props.appraisal.discountedCashFlowInputs.leasingPeriod} onChange={(newValue) => this.changeDCFInput('leasingPeriod', newValue)}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <strong>Lag Vacancy (Months)</strong>
                                    </td>
                                    <td>
                                        <FieldDisplayEdit type={"number"} value={this.props.appraisal.discountedCashFlowInputs.renewalPeriod} onChange={(newValue) => this.changeDCFInput('renewalPeriod', newValue)}/>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </Col>
                        <Col xs={12} sm={6} md={4}>
                            <table className="table">
                                <tbody>
                                </tbody>
                            </table>
                        </Col>
                    </Row>
                </div>
                : null
        );
    }
}

export default ViewTenantsLeasingCosts;

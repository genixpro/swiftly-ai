import React from 'react';
import { translate, Trans } from 'react-i18next';
import ContentWrapper from '../components/Layout/ContentWrapper';
import { Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Card, CardBody, CardHeader, CardText, CardTitle, FormGroup, Input,  Nav, NavItem, NavLink } from 'reactstrap';
import axios from 'axios';
import ResizeObserver from 'resize-observer-polyfill';
import _ from 'underscore';
import UploadFiles from "./UploadFiles";
import ViewLeases from "./ViewLeases";
import { NavLink as RRNavLink } from 'react-router-dom';


class ViewLeaseReport extends React.Component
{
    state = {
        width: 0,
        height: 0,
        lease: {
            extractedData:{},
            words: []
        }
    };

    componentDidMount()
    {
        this.setState({"lease": this.props.lease});
    }

    componentDidUpdate()
    {


    }

    render() {
        return (
            <div id={"view-lease-report"}>
                <Row>
                    <Col xs={12} md={8}>
                        <Card outline color="primary" className="mb-3">
                            <CardHeader className="text-white bg-primary">Property Description</CardHeader>

                            <table>
                                <tbody>
                                    <tr className={"lease-report-row"}><td className={"lease-report-variable-name"}>Tenant</td><td>{this.state.lease.extractedData.counterparty_name}</td></tr>
                                    <tr className={"lease-report-row"}><td className={"lease-report-variable-name"}>Lease Term</td><td><span>5 years – September 1, 2016 to August 31, 2021 (renewal)</span></td></tr>
                                    <tr className={"lease-report-row"}><td className={"lease-report-variable-name"}>Size</td><td><span>70,742 square feet</span></td></tr>
                                    <tr className={"lease-report-row"}><td className={"lease-report-variable-name"}>Rent</td><td><span>$5.70 per square foot ($403,229.40 per annum)</span></td></tr>
                                    <tr className={"lease-report-row"}><td className={"lease-report-variable-name"}>Additional Rent</td><td>
                                        <p>The lease provides for rent on a fully net basis, whereby the tenant is responsible for
                                            payment of building insurance premiums, salaries, amortized capital work and realty
                                            taxes. As stipulated in the lease agreement, a reasonable management fee keeping with
                                            the industry standard is recoverable by the landlord.</p>

                                        <p>Unless the landlord elects to perform such work at tenant’s cost, tenant shall maintain and
                                            repair the leased premises including painting (interior & exterior), structural and HVAC.
                                            Items of capital nature shall be amortized over useful life of such item.</p>
                                    </td></tr>
                                    <tr className={"lease-report-row"}><td className={"lease-report-variable-name"}>Option to Renew</td><td>
                                        <p>Two options, for five years each at fair market rates with 9-12 months written notice. The fair
                                            market rent shall be based on rates of similar size building, use and location without
                                            deduction or allowance or consideration of any inducements to achieve such rental rates.
                                            The rental rate for each extension term shall not be less than the rent payable during the
                                            preceding 12 months.</p>
                                    </td></tr>
                                    <tr className={"lease-report-row"}><td className={"lease-report-variable-name"}>Free Rent</td><td>
                                        <p>The tenant receives 3 months of free net rent upon renewal (Sep. 1 to Nov. 30, 2016).</p>
                                    </td></tr>
                                    <tr className={"lease-report-row"}><td className={"lease-report-variable-name"}>Greenhouse</td><td>
                                        <p>Tenant shall be solely responsible for operating, repairing and maintaining the greenhouse
                                            structure. The tenant is not required to remove the greenhouse structure upon the
                                            expiry/termination of the lease.</p>
                                    </td></tr>
                                </tbody>
                            </table>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ViewLeaseReport;

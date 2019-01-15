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
import LeaseFields from "./LeaseFields";


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
                                    {
                                        LeaseFields.map((group) =>
                                        {
                                            return <div>
                                                {group.fields.map((field) =>
                                                    <tr className={"lease-report-row"}>
                                                        <td className={"lease-report-variable-name"}>{field.name}</td>
                                                        <td>{this.state.lease.extractedData[field.field]}</td>
                                                    </tr>)}
                                                </div>;
                                        })
                                    }
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

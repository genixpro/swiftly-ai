import React from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
import _ from 'underscore';

class ComparableLeaseSearch extends React.Component
{
    state = {
        value: "",
        search: {}
    };

    componentDidMount()
    {
        this.setState({search: this.props.defaultSearch})
    }

    changeSearchField(field, value)
    {
        const search = this.state.search;
        if (value === null || value === "")
        {
            if (!_.isUndefined(search[field]))
            {
                delete search[field];
            }
        }
        else
        {
            search[field] = value;
        }
        this.setState({search: search});

        if (this.props.onChange)
        {
            this.props.onChange(search);
        }
    }

    render()
    {
        return (
            <Row>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>
                            <Row>
                                <Col xs={12} sm={6} md={4}>
                                    <table>
                                    <tbody>
                                    <tr>
                                        <td>
                                            <strong>Lease Date Start:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"date"}
                                                    value={this.state.search.leaseDateFrom}
                                                    onChange={(newValue) => this.changeSearchField("leaseDateFrom", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Lease Date End:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"date"}
                                                    value={this.state.search.leaseDateTo}
                                                    onChange={(newValue) => this.changeSearchField("leaseDateTo", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Property Type:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"propertyType"}
                                                    value={this.state.search.propertyType}
                                                    onChange={(newValue) => this.changeSearchField("propertyType", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Sub Type:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"tags"}
                                                    propertyType={this.state.search.propertyType}
                                                    value={this.state.search.propertyTags}
                                                    onChange={(newValue) => this.changeSearchField("propertyTags", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    </tbody>
                                    </table>
                                </Col>
                                <Col xs={12} sm={6} md={4}>
                                    <table>
                                    <tbody>
                                    <tr>
                                        <td>
                                            <strong>Size of Unit Low:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"area"}
                                                    value={this.state.search.sizeOfUnitFrom}
                                                    onChange={(newValue) => this.changeSearchField("sizeOfUnitFrom", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Size of Unit High:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"area"}
                                                    value={this.state.search.sizeOfUnitTo}
                                                    onChange={(newValue) => this.changeSearchField("sizeOfUnitTo", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}

                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Net / Gross:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"rentType"}
                                                    value={this.state.search.rentType}
                                                    onChange={(newValue) => this.changeSearchField("rentType", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Tenant Name:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"text"}
                                                    value={this.state.search.tenantName}
                                                    onChange={(newValue) => this.changeSearchField("tenantName", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    </tbody>
                                    </table>
                                </Col>
                                <Col xs={12} sm={6} md={4}>
                                    <table>
                                    <tbody>
                                    <tr>
                                        <td>
                                            <strong>Yearly Rent Low:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"currency"}
                                                    value={this.state.search.yearlyRentFrom}
                                                    onChange={(newValue) => this.changeSearchField("yearlyRentFrom", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Yearly Rent High:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"currency"}
                                                    value={this.state.search.yearlyRentTo}
                                                    onChange={(newValue) => this.changeSearchField("yearlyRentTo", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}

                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>TMI Low:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"currency"}
                                                    value={this.state.search.taxesMaintenanceInsuranceFrom}
                                                    onChange={(newValue) => this.changeSearchField("taxesMaintenanceInsuranceFrom", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>TMI High:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"currency"}
                                                    value={this.state.search.taxesMaintenanceInsuranceTo}
                                                    onChange={(newValue) => this.changeSearchField("taxesMaintenanceInsuranceTo", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}

                                                />
                                            }
                                        </td>
                                    </tr>
                                    </tbody>
                                    </table>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        );
    }
}


export default ComparableLeaseSearch;


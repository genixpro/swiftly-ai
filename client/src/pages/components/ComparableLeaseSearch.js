import React from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
import Datetime from 'react-datetime';
import PropertyTypeSelector from './PropertyTypeSelector';
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
                                    <tbody>
                                    <tr>
                                        <td>
                                            <strong>Lease Date Start:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
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
                                                    type={"propertyType"}
                                                    value={this.state.search.propertyType}
                                                    onChange={(newValue) => this.changeSearchField("propertyType", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    </tbody>
                                </Col>
                                <Col xs={12} sm={6} md={4}>
                                    <tbody>
                                    <tr>
                                        <td>
                                            <strong>Size of Unit Low:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    type={"number"}
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
                                                    type={"number"}
                                                    value={this.state.search.sizeOfUnitTo}
                                                    onChange={(newValue) => this.changeSearchField("sizeOfUnitTo", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}

                                                />
                                            }
                                        </td>
                                    </tr>
                                    </tbody>
                                </Col>
                                <Col xs={12} sm={6} md={4}>
                                    <tbody>
                                    <tr>
                                        <td>
                                            <strong>Yearly Rent Low:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
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
                                                    type={"currency"}
                                                    value={this.state.search.yearlyRentTo}
                                                    onChange={(newValue) => this.changeSearchField("yearlyRentTo", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}

                                                />
                                            }
                                        </td>
                                    </tr>
                                    </tbody>
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


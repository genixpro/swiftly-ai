import React from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
import Datetime from 'react-datetime';
import PropertyTypeSelector from './PropertyTypeSelector';
import _ from 'underscore';

class ComparableSaleSearch extends React.Component
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
                                            <strong>Sale Date Start:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    type={"date"}
                                                    value={this.state.search.saleDateFrom}
                                                    onChange={(newValue) => this.changeSearchField("saleDateFrom", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Sale Date End:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    type={"date"}
                                                    value={this.state.search.saleDateTo}
                                                    onChange={(newValue) => this.changeSearchField("saleDateTo", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Cap Rate Low:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    type={"number"}
                                                    value={this.state.search.capitalizationRateFrom}
                                                    onChange={(newValue) => this.changeSearchField("capitalizationRateFrom", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Cap Rate High:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    type={"number"}
                                                    value={this.state.search.capitalizationRateTo}
                                                    onChange={(newValue) => this.changeSearchField("capitalizationRateTo", newValue)}
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
                                            <strong>Sale Price Low:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    type={"currency"}
                                                    value={this.state.search.salePriceFrom}
                                                    onChange={(newValue) => this.changeSearchField("salePriceFrom", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Sale Price High:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    type={"currency"}
                                                    value={this.state.search.salePriceTo}
                                                    onChange={(newValue) => this.changeSearchField("salePriceTo", newValue)}
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
                                            <strong>Leasable Area Low:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    type={"currency"}
                                                    value={this.state.search.leasableAreaFrom}
                                                    onChange={(newValue) => this.changeSearchField("leasableAreaFrom", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Leasable Area High:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    type={"currency"}
                                                    value={this.state.search.leasableAreaTo}
                                                    onChange={(newValue) => this.changeSearchField("leasableAreaTo", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}

                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Tags:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    type={"tags"}
                                                    value={this.state.search.propertyTags}
                                                    onChange={(newValue) => this.changeSearchField("propertyTags", newValue)}
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


export default ComparableSaleSearch;


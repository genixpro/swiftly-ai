import React from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
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
                                    <table>
                                    <tbody>
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
                                            <strong>Tenancy Is:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"tenancyType"}
                                                    value={this.state.search.tenancyType}
                                                    onChange={(newValue) => this.changeSearchField("tenancyType", newValue)}
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

                                    {
                                        this.state.search.propertyType === 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Sale Date Start:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"date"}
                                                            value={this.state.search.saleDateFrom}
                                                            onChange={(newValue) => this.changeSearchField("saleDateFrom", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}
                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }

                                    {
                                        this.state.search.propertyType === 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Sale Date End:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"date"}
                                                            value={this.state.search.saleDateTo}
                                                            onChange={(newValue) => this.changeSearchField("saleDateTo", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}
                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }

                                    {
                                        this.state.search.propertyType === 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Sale Price Low:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"currency"}
                                                            value={this.state.search.salePriceFrom}
                                                            onChange={(newValue) => this.changeSearchField("salePriceFrom", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}
                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }

                                    {
                                        this.state.search.propertyType === 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Sale Price High:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"currency"}
                                                            value={this.state.search.salePriceTo}
                                                            onChange={(newValue) => this.changeSearchField("salePriceTo", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}

                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }


                                    {
                                        this.state.search.propertyType !== 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Cap Rate Low:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"number"}
                                                            value={this.state.search.capitalizationRateFrom}
                                                            onChange={(newValue) => this.changeSearchField("capitalizationRateFrom", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}
                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.state.search.propertyType !== 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Cap Rate High:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"number"}
                                                            value={this.state.search.capitalizationRateTo}
                                                            onChange={(newValue) => this.changeSearchField("capitalizationRateTo", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}
                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.state.search.propertyType === 'industrial' ?
                                            <tr>
                                                <td>
                                                    <strong>Clear Ceiling Height Low:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"length"}
                                                            value={this.state.search.clearCeilingHeightFrom}
                                                            onChange={(newValue) => this.changeSearchField("clearCeilingHeightFrom", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}

                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.state.search.propertyType === 'industrial' ?
                                            <tr>
                                                <td>
                                                    <strong>Clear Ceiling Height High:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"length"}
                                                            value={this.state.search.clearCeilingHeightTo}
                                                            onChange={(newValue) => this.changeSearchField("clearCeilingHeightTo", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}

                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    </tbody>
                                    </table>
                                </Col>
                                <Col xs={12} sm={6} md={4}>
                                    <table>
                                    <tbody>
                                    {
                                        this.state.search.propertyType !== 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Sale Date Start:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"date"}
                                                            value={this.state.search.saleDateFrom}
                                                            onChange={(newValue) => this.changeSearchField("saleDateFrom", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}
                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.state.search.propertyType !== 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Sale Date End:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"date"}
                                                            value={this.state.search.saleDateTo}
                                                            onChange={(newValue) => this.changeSearchField("saleDateTo", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}
                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.state.search.propertyType !== 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Sale Price Low:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"currency"}
                                                            value={this.state.search.salePriceFrom}
                                                            onChange={(newValue) => this.changeSearchField("salePriceFrom", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}
                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }

                                    {
                                        this.state.search.propertyType !== 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Sale Price High:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"currency"}
                                                            value={this.state.search.salePriceTo}
                                                            onChange={(newValue) => this.changeSearchField("salePriceTo", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}

                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.state.search.propertyType === 'industrial' ?
                                            <tr>
                                                <td>
                                                    <strong>Shipping Doors Low:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"number"}
                                                            value={this.state.search.shippingDoorsFrom}
                                                            onChange={(newValue) => this.changeSearchField("shippingDoorsFrom", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}

                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.state.search.propertyType === 'industrial' ?
                                            <tr>
                                                <td>
                                                    <strong>Shipping Doors High:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"number"}
                                                            value={this.state.search.shippingDoorsTo}
                                                            onChange={(newValue) => this.changeSearchField("shippingDoorsTo", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}

                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.state.search.propertyType === 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Site Area (acres) Low:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"number"}
                                                            value={this.state.search.sizeOfLandAcresFrom}
                                                            onChange={(newValue) => this.changeSearchField("sizeOfLandAcresFrom", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}
                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }

                                    {
                                        this.state.search.propertyType === 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Site Area (acres) High:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"number"}
                                                            value={this.state.search.sizeOfLandAcresTo}
                                                            onChange={(newValue) => this.changeSearchField("sizeOfLandAcresTo", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}

                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.state.search.propertyType === 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Site Area (sqft) Low:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"number"}
                                                            value={this.state.search.sizeOfLandSqftFrom}
                                                            onChange={(newValue) => this.changeSearchField("sizeOfLandSqftFrom", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}
                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }

                                    {
                                        this.state.search.propertyType === 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Site Area (sqft) High:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"number"}
                                                            value={this.state.search.sizeOfLandSqftTo}
                                                            onChange={(newValue) => this.changeSearchField("sizeOfLandSqftTo", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}

                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.state.search.propertyType === 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Buildable Units Low:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"number"}
                                                            value={this.state.search.shippingDoorsFrom}
                                                            onChange={(newValue) => this.changeSearchField("shippingDoorsFrom", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}

                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.state.search.propertyType === 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Buildable Units High:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"number"}
                                                            value={this.state.search.shippingDoorsTo}
                                                            onChange={(newValue) => this.changeSearchField("shippingDoorsTo", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}

                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    </tbody>
                                    </table>
                                </Col>
                                <Col xs={12} sm={6} md={4}>
                                    <table>
                                    <tbody>
                                    {
                                        this.state.search.propertyType !== 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Leasable Area Low:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"number"}
                                                            value={this.state.search.leasableAreaFrom}
                                                            onChange={(newValue) => this.changeSearchField("leasableAreaFrom", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}
                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.state.search.propertyType !== 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Leasable Area High:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"number"}
                                                            value={this.state.search.leasableAreaTo}
                                                            onChange={(newValue) => this.changeSearchField("leasableAreaTo", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}

                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.state.search.propertyType !== 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Price Per Square Foot Low:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"number"}
                                                            value={this.state.search.pricePerSquareFootFrom}
                                                            onChange={(newValue) => this.changeSearchField("pricePerSquareFootFrom", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}
                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }

                                    {
                                        this.state.search.propertyType !== 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Price Per Square Foot Low:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"number"}
                                                            value={this.state.search.pricePerSquareFootTo}
                                                            onChange={(newValue) => this.changeSearchField("pricePerSquareFootTo", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}

                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.state.search.propertyType === 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Price Per Acre Low:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"currency"}
                                                            value={this.state.search.pricePerAcreLandFrom}
                                                            onChange={(newValue) => this.changeSearchField("pricePerAcreLandFrom", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}

                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.state.search.propertyType === 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Price Per Acre High:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"currency"}
                                                            value={this.state.search.pricePerAcreLandTo}
                                                            onChange={(newValue) => this.changeSearchField("pricePerAcreLandTo", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}

                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.state.search.propertyType === 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Price Per Square Foot Land Low:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"currency"}
                                                            value={this.state.search.pricePerSquareFootLandFrom}
                                                            onChange={(newValue) => this.changeSearchField("pricePerSquareFootLandFrom", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}

                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.state.search.propertyType === 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Price Per Square Foot Land High:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"currency"}
                                                            value={this.state.search.pricePerSquareFootLandTo}
                                                            onChange={(newValue) => this.changeSearchField("pricePerSquareFootLandTo", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}

                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.state.search.propertyType === 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Price Per Square Foot Buildable Low:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"number"}
                                                            value={this.state.search.pricePerSquareFootBuildableAreaFrom}
                                                            onChange={(newValue) => this.changeSearchField("pricePerSquareFootBuildableAreaFrom", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}
                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }

                                    {
                                        this.state.search.propertyType === 'land' ?
                                            <tr>
                                                <td>
                                                    <strong>Price Per Square Foot Buildable High:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"number"}
                                                            value={this.state.search.pricePerSquareFootBuildableAreaTo}
                                                            onChange={(newValue) => this.changeSearchField("pricePerSquareFootBuildableAreaTo", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}

                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.state.search.propertyType === 'industrial' ?
                                            <tr>
                                                <td>
                                                    <strong>Size Coverage Low:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"number"}
                                                            value={this.state.search.siteCoverageFrom}
                                                            onChange={(newValue) => this.changeSearchField("siteCoverageFrom", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}

                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
                                    {
                                        this.state.search.propertyType === 'industrial' ?
                                            <tr>
                                                <td>
                                                    <strong>Site Coverage High:</strong>
                                                </td>
                                                <td>
                                                    {
                                                        <FieldDisplayEdit
                                                            isSearch={true}
                                                            type={"number"}
                                                            value={this.state.search.siteCoverageTo}
                                                            onChange={(newValue) => this.changeSearchField("siteCoverageTo", newValue)}
                                                            hideInput={false}
                                                            hideIcon={true}

                                                        />
                                                    }
                                                </td>
                                            </tr> : null
                                    }
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


export default ComparableSaleSearch;


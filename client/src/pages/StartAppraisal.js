import React from 'react';
import ContentWrapper from '../components/Layout/ContentWrapper';
import {Row, Col, Card, CardBody, FormGroup, Input} from 'reactstrap';
import axios from 'axios';
import FieldDisplayEdit from "./components/FieldDisplayEdit";
import Sidebar from "../components/Layout/Sidebar";
import mixpanel from "mixpanel-browser";

class StartAppraisal extends React.Component
{

    state = {
        dropdownOpen: false,
        mode: 'type',
        newAppraisal: {}
    };

    componentDidMount() {
        mixpanel.track("view-new-appraisal");
    }

    changeLanguage = lng =>
    {
        this.props.i18n.changeLanguage(lng);
    };

    toggle = () =>
    {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    };


    createAppraisal(evt)
    {
        mixpanel.track("create-appraisal");

        evt.preventDefault();

        axios.post("/appraisal/", this.state.newAppraisal).then((response) =>
        {
            const newId = response.data._id;
            
            Sidebar.getGlobalSidebar().changeAppraisalType(this.state.newAppraisal.appraisalType);

            this.props.history.push('/appraisal/' + newId + "/upload");

        });
    }

    updateValue(field, value)
    {
        const newAppraisal = this.state.newAppraisal;
        newAppraisal[field] = value;

        this.setState({newAppraisal: newAppraisal})
    }


    appraisalTypeSelected(type)
    {
        if (this.state.newAppraisal.appraisalType === type)
        {
            const newAppraisal = this.state.newAppraisal;
            newAppraisal.appraisalType = null;
            this.setState({
                newAppraisal: newAppraisal,
                mode: "type"
            })
        }
        else
        {
            const newAppraisal = this.state.newAppraisal;
            newAppraisal.appraisalType = type;
            this.setState({
                newAppraisal: newAppraisal,
                mode: "fields"
            })
        }

    }


    render()
    {
        return (
            <ContentWrapper>
                <div className={"start-appraisal"}>
                    <div className="content-heading">
                        <div>Start a New Appraisal

                            {/* Breadcrumb below title */}
                            <ol className="breadcrumb breadcrumb px-0 pb-0">
                                <li className="breadcrumb-item"><a href="/">Home</a></li>
                                <li className="breadcrumb-item"><a href="/appraisals/">Appraisals</a></li>
                                <li className="breadcrumb-item active">New Appraisal</li>
                            </ol>
                        </div>
                    </div>
                    <Row>
                        <div className={"selector-fields-wrapper"}>
                            <div className={"appraisal-type-selector"}>
                                {
                                    this.state.mode === 'type' || (this.state.mode === 'fields' && this.state.newAppraisal.appraisalType === 'simple') ?
                                        <div onClick={() => this.appraisalTypeSelected("simple")}>
                                            <Card outline color={"primary"} className={"appraisal-type-button"}>
                                                <em className="type-icon fa-2x icon-doc mr-2"></em>

                                                <div className={"description-block"}>
                                                    <div className={"title-wrapper"}>
                                                        <span className={"title"}>Start A Simple Appraisal</span>
                                                    </div>
                                                    <div className={"features-list-wrapper"}>
                                                        <ul>
                                                            <li>Basic Rent Roll</li>
                                                            <li>Stabilized Statement</li>
                                                            <li>Comparable Sales</li>
                                                        </ul>
                                                        <ul>
                                                            <li>Comparable Leases</li>
                                                            <li>Capitalization Approach</li>
                                                            <li>Direct Comparison Approach</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div> : null
                                }
                                {
                                    this.state.mode === 'type' || (this.state.mode === 'fields' && this.state.newAppraisal.appraisalType === 'detailed') ?
                                        <div onClick={() => this.appraisalTypeSelected("detailed")}>
                                            <Card outline color={"primary"} className={"appraisal-type-button"}>
                                                <em className="type-icon fa-2x icon-docs mr-2"></em>

                                                <div className={"description-block"}>
                                                    <div className={"title-wrapper"}>
                                                        <span className={"title"}>Start A Detailed Appraisal</span>
                                                    </div>
                                                    <div className={"features-list-wrapper"}>
                                                        <ul>
                                                            <li>Full Rent Roll</li>
                                                            <li>Market Rents</li>
                                                            <li>Leasing Cost Structures</li>
                                                            <li>Recovery Structures</li>
                                                            <li>Detailed Expenses</li>
                                                            <li>Additional Income</li>
                                                        </ul>
                                                        <ul>
                                                            <li>Amortization</li>
                                                            <li>Stabilized Statement</li>
                                                            <li>Comparable Sales</li>
                                                            <li>Comparable Leases</li>
                                                            <li>Capitalization Approach</li>
                                                            <li>Direct Comparison Approach</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div> : null
                                }
                            </div>
                            {
                                this.state.mode === 'fields' ?
                                    <div className={"appraisal-fields-area"}>
                                        <Card className="card-default">
                                            <CardBody>
                                                <form onSubmit={this.createAppraisal.bind(this)}>
                                                    <FormGroup>
                                                        <label>Name</label>
                                                        <Input
                                                            type="text"
                                                            placeholder="Name"
                                                            onChange={(evt) => this.updateValue("name", evt.target.value)}
                                                            value={this.state.newAppraisal.name}
                                                        />
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <label>Street Address</label>
                                                        <FieldDisplayEdit
                                                            type={"address"}
                                                            edit={this.props.edit}
                                                            hideInput={false}
                                                            hideIcon={true}
                                                            placeholder={"Address"}
                                                            value={this.state.newAppraisal.address}
                                                            onChange={(newValue) => this.updateValue('address', newValue)}
                                                            onGeoChange={(newValue) => this.updateValue('location', {
                                                                "type": "Point",
                                                                "coordinates": [newValue.lng, newValue.lat]
                                                            })}
                                                        />
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <label>Effective Date</label>
                                                        <FieldDisplayEdit
                                                            type={"date"}
                                                            edit={this.props.edit}
                                                            hideInput={false}
                                                            hideIcon={true}
                                                            placeholder={"Effective Date"}
                                                            value={this.state.newAppraisal.effectiveDate}
                                                            onChange={(newValue) => this.updateValue('effectiveDate', newValue)}
                                                        />
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <label>Property Type</label>
                                                        <FieldDisplayEdit
                                                            type={"propertyType"}
                                                            edit={this.props.edit}
                                                            hideInput={false}
                                                            hideIcon={true}
                                                            placeholder={"Property Type"}
                                                            value={this.state.newAppraisal.propertyType}
                                                            onChange={(newValue) => this.updateValue('propertyType', newValue)}
                                                        />
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <label>Sub Type</label>
                                                        <FieldDisplayEdit
                                                            type={"tags"}
                                                            edit={this.props.edit}
                                                            hideInput={false}
                                                            hideIcon={true}
                                                            placeholder={"Sub Type"}
                                                            value={this.state.newAppraisal.propertyTags}
                                                            onChange={(newValue) => this.updateValue('propertyTags', newValue)}
                                                        />
                                                    </FormGroup>
                                                    <button className="btn btn-sm btn-primary" type="submit" onClick={this.createAppraisal.bind(this)}>Create
                                                    </button>
                                                </form>
                                            </CardBody>
                                        </Card>
                                    </div> : null
                            }
                        </div>
                    </Row>
                </div>
            </ContentWrapper>
        );
    }
}

export default StartAppraisal;

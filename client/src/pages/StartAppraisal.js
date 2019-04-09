import React from 'react';
import ContentWrapper from '../components/Layout/ContentWrapper';
import { Row, Card, CardBody, FormGroup, Input } from 'reactstrap';
import axios from 'axios';
import FieldDisplayEdit from "./components/FieldDisplayEdit";

class StartAppraisal extends React.Component {

    state = {
        dropdownOpen: false,
        newAppraisal: {}
    };

    changeLanguage = lng => {
        this.props.i18n.changeLanguage(lng);
    };

    toggle = () => {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    };


    createAppraisal(evt)
    {
        evt.preventDefault();

        axios.post("/appraisal/", this.state.newAppraisal).then((response) =>
        {
            const newId = response.data._id;

            this.props.history.push('/appraisal/' + newId + "/upload");

        });
    }

    updateValue(field, value)
    {
        const newAppraisal = this.state.newAppraisal;
        newAppraisal[field] = value;

        this.setState({newAppraisal: newAppraisal})
    }


    render() {
        return (
            <ContentWrapper>
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
                    <div className="col-md-6">
                        {/* START card */}
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
                                            onGeoChange={(newValue) => this.updateValue('location', {"type": "Point", "coordinates": [newValue.lng, newValue.lat]})}
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
                                        <label>Building Size</label>
                                        <FieldDisplayEdit
                                            type={"buildingSize"}
                                            edit={this.props.edit}
                                            hideInput={false}
                                            hideIcon={true}
                                            placeholder={"Building Size"}
                                            value={this.state.newAppraisal.buildingSize}
                                            onChange={(newValue) => this.updateValue('buildingSize', newValue)}
                                        />
                                    </FormGroup>
                                    <button className="btn btn-sm btn-primary" type="submit" onClick={this.createAppraisal.bind(this)}>Create</button>
                                </form>
                            </CardBody>
                        </Card>
                        {/* END card */}
                    </div>
                </Row>
            </ContentWrapper>
        );
    }
}

export default StartAppraisal;

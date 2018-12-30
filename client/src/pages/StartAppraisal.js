import React from 'react';
import { translate, Trans } from 'react-i18next';
import ContentWrapper from '../components/Layout/ContentWrapper';
import { Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Card, CardBody, CardHeader, FormGroup, Input } from 'reactstrap';
import axios from 'axios';

class StartAppraisal extends React.Component {

    state = {
        dropdownOpen: false
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

        axios.post("/appraisal/", {
            name: this.state.name,
            address: this.state.address,
            city: this.state.city,
            region: this.state.state,
            country: this.state.country
        }).then((response) =>
        {
            console.log(response.data)
            const newId = response.data._id;

            this.props.history.push('/appraisal/' + newId);

        });
    }

    updateForm(field, event)
    {
        this.setState({[field]: event.target.value})
    }


    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    <div>Start a New Appraisal</div>
                </div>
                <Row>
                    <div className="col-md-6">
                        {/* START card */}
                        <Card className="card-default">
                            <CardBody>
                                <form onSubmit={this.createAppraisal.bind(this)}>
                                    <FormGroup>
                                        <label>Name</label>
                                        <Input type="text" placeholder="Name" onChange={this.updateForm.bind(this, "name")}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <label>Street Address</label>
                                        <Input type="text" placeholder="Address" onChange={this.updateForm.bind(this, "address")}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <label>City</label>
                                        <Input type="text" placeholder="City" onChange={this.updateForm.bind(this, "city")}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <label>State / Province / Region</label>
                                        <Input type="text" placeholder="Region" onChange={this.updateForm.bind(this, "region")}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <label>Country</label>
                                        <Input type="text" placeholder="Country" onChange={this.updateForm.bind(this, "country")}/>
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

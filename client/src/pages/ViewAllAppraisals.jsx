import React from 'react';
import ContentWrapper from '../components/Layout/ContentWrapper';
import { Row } from 'reactstrap';
import axios from '@api/client';
import AppraisalList from './components/AppraisalList';
import AppraisalModel from "../models/AppraisalModel";
import {Link} from "react-router";

class ViewAllAppraisals extends React.Component {

    state = {
        appraisals: []
    };


    componentDidMount()
    {
        document.title = "Appraisals – Swiftly";
        if (this.heading) this.heading.focus();
        this.reloadAppraisals();
    }


    reloadAppraisals()
    {
        axios.get("/appraisals/").then((response) =>
        {
            this.setState({appraisals: response.data.appraisals.map((appraisal) => AppraisalModel.create(appraisal))});
        });
    }


    deleteAppraisal(appraisal)
    {
        axios.delete("/appraisals/" + appraisal._id).then((response) =>
        {
            this.reloadAppraisals();
        });
    }

    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    <div><h1 className="page-title" tabIndex="-1" ref={(heading) => this.heading = heading}>View All Appraisals</h1>

                        {/* Breadcrumb below title */}
                        <ol className="breadcrumb breadcrumb px-0 pb-0" aria-label="Breadcrumb">
                            <li className="breadcrumb-item"><Link to="/appraisals/">Home</Link></li>
                            <li className="breadcrumb-item active" aria-current="page">Appraisals</li>
                        </ol>
                    </div>
                </div>
                <Row>
                    <div className="col-12 col-xl-8">
                        <AppraisalList appraisals={this.state.appraisals} navigate={this.props.navigate} search={this.props.search} deleteAppraisal={(appraisal) => this.deleteAppraisal(appraisal)}/>
                    </div>
                </Row>
            </ContentWrapper>
        );
    }
}

export default ViewAllAppraisals;

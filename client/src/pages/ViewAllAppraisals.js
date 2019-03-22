import React from 'react';
import ContentWrapper from '../components/Layout/ContentWrapper';
import { Row } from 'reactstrap';
import axios from 'axios';
import AppraisalList from './components/AppraisalList';


class ViewAllAppraisals extends React.Component {

    state = {
        appraisals: []
    };


    componentDidMount()
    {
        this.reloadAppraisals();
    }


    reloadAppraisals()
    {
        axios.get("/appraisal/").then((response) =>
        {
            this.setState({appraisals: response.data.appraisals});
        });
    }


    deleteAppraisal(appraisal)
    {
        axios.delete("/appraisal/" + appraisal._id['$oid']).then((response) =>
        {
            this.reloadAppraisals();
        });
    }

    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    <div>View All Appraisals</div>
                </div>
                <Row>
                    <div className="col-md-6">
                        <AppraisalList appraisals={this.state.appraisals} history={this.props.history} deleteAppraisal={(appraisal) => this.deleteAppraisal(appraisal)}/>
                    </div>
                </Row>
            </ContentWrapper>
        );
    }
}

export default ViewAllAppraisals;

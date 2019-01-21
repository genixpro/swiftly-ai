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
        axios.get("/appraisal/").then((response) =>
        {
            this.setState({appraisals: response.data.appraisals});
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
                        <AppraisalList appraisals={this.state.appraisals} history={this.props.history}/>
                    </div>
                </Row>
            </ContentWrapper>
        );
    }
}

export default ViewAllAppraisals;

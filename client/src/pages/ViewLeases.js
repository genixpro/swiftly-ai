import React from 'react';
import { Row, Col } from 'reactstrap';
import axios from 'axios';
import LeaseList from "./components/LeaseList"


class ViewLeases extends React.Component
{
    state = {
        leases: []
    };

    componentDidMount()
    {
        axios.get(`/appraisal/${this.props.match.params.id}/leases`).then((response) =>
        {
            this.setState({leases: response.data.leases})
        });
    }


    render() {
        return (
            <div>
                <Row>
                    <Col xs={12}>
                        <h3>View Leases</h3>
                    </Col>
                    <Col xs={12}>
                        <LeaseList leases={this.state.leases} history={this.props.history} appraisalId={this.props.match.params.id}/>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ViewLeases;

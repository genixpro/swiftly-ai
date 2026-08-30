import React from 'react';
import { Row, Col, Card, CardBody} from 'reactstrap';
import {filesApi} from '@api/resources';
import LeaseList from "./components/LeaseList"
import FileModel from "../models/FileModel";


class ViewLeases extends React.Component
{
    state = {
        leases: []
    };

    componentDidMount()
    {
        filesApi.list(this.props.appraisalId, 'lease').then((files) =>
        {
            this.setState({leases: files.map((file) => FileModel.create(file))})
        });
    }


    render() {
        return (
            <Row>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>
                            <div>
                                <Row>
                                    <Col xs={12}>
                                        <h3>View Leases</h3>
                                    </Col>
                                    <Col xs={12}>
                                        <LeaseList leases={this.state.leases} navigate={this.props.navigate} search={this.props.search} appraisalId={this.props.appraisalId}/>
                                    </Col>
                                </Row>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        );
    }
}

export default ViewLeases;

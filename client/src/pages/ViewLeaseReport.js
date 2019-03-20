import React from 'react';
import {Row, Col, Card, CardHeader, CardBody} from 'reactstrap';
import LeaseFields from "./LeaseFields";


class ViewLeaseReport extends React.Component {
    state = {
        width: 0,
        height: 0,
        lease: {
            extractedData: {},
            words: []
        }
    };

    componentDidMount() {
        this.setState({"lease": this.props.lease});
    }

    componentDidUpdate() {


    }

    render() {
        return (
            <Row>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>
                            <div id={"view-lease-report"}>
                                <Row>
                                    <Col xs={12} md={8}>
                                        <Card outline color="primary" className="mb-3">
                                            <CardHeader className="text-white bg-primary">Property
                                                Description</CardHeader>

                                            <table>
                                                <tbody>
                                                {
                                                    LeaseFields.map((group) => {
                                                        return group.fields.map((field) =>
                                                            <tr className={"lease-report-row"} key={field.field}>
                                                                <td className={"lease-report-variable-name"}>{field.name}</td>
                                                                <td>{this.state.lease.extractedData[field.field]}</td>
                                                            </tr>);
                                                    })
                                                }
                                                </tbody>
                                            </table>
                                        </Card>
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

export default ViewLeaseReport;

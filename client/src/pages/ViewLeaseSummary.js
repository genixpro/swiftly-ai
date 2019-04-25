import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, FormGroup, Input } from 'reactstrap';


class ViewLeaseExtractions extends React.Component
{
    state = {
        width: 0,
        height: 0,
        lease: {
            extractedData:{},
            words: []
        }
    };

    componentDidMount()
    {
        this.setState({"lease": this.props.lease});
    }

    componentDidUpdate()
    {

    }

    render() {
        return (
            <div id={"view-lease-extractions"}>
                <Row>
                    <Col xs={12} md={4}>
                        <Card outline color="primary" className="mb-3">
                            <CardHeader className="text-white bg-primary">Basic Information</CardHeader>
                            <CardBody>
                                <form>
                                    <FormGroup>
                                        <label>Counterparty</label>
                                        <Input type="text" placeholder="counterparty" id="counterparty-field" value={this.state.lease.extractedData.counterparty_name}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <label>Size</label>
                                        <Input type="text" placeholder="size" id="size-field" value={this.state.lease.extractedData.size}/>
                                    </FormGroup>
                                </form>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xs={12} md={4}>
                        <Card outline color="primary" className="mb-3">
                            <CardHeader className="text-white bg-primary">Financial Information</CardHeader>
                            <CardBody>
                                <form>
                                    <FormGroup>
                                        <label>Price per square Foot</label>
                                        <Input type="number" placeholder="PSF ($)"/>
                                    </FormGroup>
                                </form>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ViewLeaseExtractions;

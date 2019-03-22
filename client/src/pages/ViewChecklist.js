import React from 'react';
import {Row, Col, Card, CardBody, CardHeader, Table, Button, CardTitle, Collapse} from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import ChecklistItem from "./components/ChecklistItem";

class ViewChecklist extends React.Component {
    state = {};

    componentDidMount() {
        axios.get(`/appraisal/${this.props.match.params.id}`).then((response) => {
            this.setState({appraisal: response.data.appraisal})
        });


    }

    render() {
        return (
            <Row>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>
                            <Row>
                                <Col xs={{size: 4, offset: 4}}>
                                    {(this.state.appraisal) ?
                                        <div id={"view-checklist"} className={"view-checklist"}>
                                            <ChecklistItem title={"Building Information"}
                                                           description={"Basic information on the building - such as its address."}
                                                           completed={this.state.appraisal.validationResult.hasBuildingInformation}
                                            />
                                            <ChecklistItem title={"Rent Roll"}
                                                           description={"The Rent-Rolls with information about your tenants"}
                                                           completed={this.state.appraisal.validationResult.hasRentRoll}
                                            />
                                            <ChecklistItem title={"Income Statement"}
                                                           description={"The Income Statement for your building, showing revenues and expenses."}
                                                           completed={this.state.appraisal.validationResult.hasIncomeStatement}
                                            />
                                        </div>
                                        : null}
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        );
    }
}

export default ViewChecklist;

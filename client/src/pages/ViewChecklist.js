import React from 'react';
import {Row, Col, Card, CardBody, CardHeader, Table, Button, CardTitle, Collapse } from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import _ from 'underscore';

class ViewChecklist extends React.Component {
    state = {
        accordionState: {}
    };

    componentDidMount() {
        axios.get(`/appraisal/${this.props.match.params.id}`).then((response) => {
            this.setState({appraisal: response.data.appraisal})
        });


    }


    toggleAccordion(item)
    {
        this.state.accordionState[item] = !this.state.accordionState[item];
        this.setState({accordionState: this.state.accordionState});
    }


    render() {
        return (
            <Row>
                <Col xs={{size: 4, offset: 4}}>
                    {/*<Card className="card-default">*/}
                        {/*<CardBody>*/}
                            {(this.state.appraisal) ?
                                <div id={"view-checklist"} className={"view-checklist"}>
                                    <Card className="b0 mb-2">
                                        <CardHeader onClick={() => this.toggleAccordion(0)}>
                                            <CardTitle tag="h4">
                                                <a className="text-inherit">
                                                    <small>
                                                        <em className="fa fa-plus text-primary mr-2"></em>
                                                    </small>
                                                    <span>How can I change the color?</span>
                                                </a>
                                            </CardTitle>
                                        </CardHeader>
                                        <Collapse isOpen={this.state.accordionState[0]}>
                                            <CardBody>
                                                <p>Donec congue sagittis mi sit amet tincidunt. Quisque sollicitudin massa vel erat tincidunt blandit. Curabitur quis leo nulla. Phasellus faucibus placerat luctus. Integer fermentum molestie massa at congue. Quisque quis quam dictum diam volutpat adipiscing.</p>
                                                <p>Proin ut urna enim.</p>
                                                <div className="text-right">
                                                    <small className="text-muted mr-2">Was this information useful?</small>
                                                    <button className="btn btn-secondary btn-xs" type="button">
                                                        <em className="fa fa-thumbs-up text-muted"></em>
                                                    </button>
                                                    <button className="btn btn-secondary btn-xs" type="button">
                                                        <em className="fa fa-thumbs-down text-muted"></em>
                                                    </button>
                                                </div>
                                            </CardBody>
                                        </Collapse>
                                    </Card>
                                    <Card className="b0 mb-2">
                                        <CardHeader onClick={() => this.toggleAccordion(1)}>
                                            <CardTitle tag="h4">
                                                <a className="text-inherit">
                                                    <small>
                                                        <em className="fa fa-plus text-primary mr-2"></em>
                                                    </small>
                                                    <span>How can I change the color?</span>
                                                </a>
                                            </CardTitle>
                                        </CardHeader>
                                        <Collapse isOpen={this.state.accordionState[1]}>
                                            <CardBody>
                                                <p>Donec congue sagittis mi sit amet tincidunt. Quisque sollicitudin massa vel erat tincidunt blandit. Curabitur quis leo nulla. Phasellus faucibus placerat luctus. Integer fermentum molestie massa at congue. Quisque quis quam dictum diam volutpat adipiscing.</p>
                                                <p>Proin ut urna enim.</p>
                                                <div className="text-right">
                                                    <small className="text-muted mr-2">Was this information useful?</small>
                                                    <button className="btn btn-secondary btn-xs" type="button">
                                                        <em className="fa fa-thumbs-up text-muted"></em>
                                                    </button>
                                                    <button className="btn btn-secondary btn-xs" type="button">
                                                        <em className="fa fa-thumbs-down text-muted"></em>
                                                    </button>
                                                </div>
                                            </CardBody>
                                        </Collapse>
                                    </Card>
                                    <Card className="b0 mb-2">
                                        <CardHeader onClick={() => this.toggleAccordion(2)}>
                                            <CardTitle tag="h4">
                                                <a className="text-inherit">
                                                    <small>
                                                        <em className="fa fa-plus text-primary mr-2"></em>
                                                    </small>
                                                    <span>How can I change the color?</span>
                                                </a>
                                            </CardTitle>
                                        </CardHeader>
                                        <Collapse isOpen={this.state.accordionState[2]}>
                                            <CardBody>
                                                <p>Donec congue sagittis mi sit amet tincidunt. Quisque sollicitudin massa vel erat tincidunt blandit. Curabitur quis leo nulla. Phasellus faucibus placerat luctus. Integer fermentum molestie massa at congue. Quisque quis quam dictum diam volutpat adipiscing.</p>
                                                <p>Proin ut urna enim.</p>
                                                <div className="text-right">
                                                    <small className="text-muted mr-2">Was this information useful?</small>
                                                    <button className="btn btn-secondary btn-xs" type="button">
                                                        <em className="fa fa-thumbs-up text-muted"></em>
                                                    </button>
                                                    <button className="btn btn-secondary btn-xs" type="button">
                                                        <em className="fa fa-thumbs-down text-muted"></em>
                                                    </button>
                                                </div>
                                            </CardBody>
                                        </Collapse>
                                    </Card>
                                    <Card className="b0 mb-2">
                                        <CardHeader onClick={() => this.toggleAccordion(3)}>
                                            <CardTitle tag="h4">
                                                <a className="text-inherit">
                                                    <small>
                                                        <em className="fa fa-plus text-primary mr-2"></em>
                                                    </small>
                                                    <span>How can I change the color?</span>
                                                </a>
                                            </CardTitle>
                                        </CardHeader>
                                        <Collapse isOpen={this.state.accordionState[3]}>
                                            <CardBody>
                                                <p>Donec congue sagittis mi sit amet tincidunt. Quisque sollicitudin massa vel erat tincidunt blandit. Curabitur quis leo nulla. Phasellus faucibus placerat luctus. Integer fermentum molestie massa at congue. Quisque quis quam dictum diam volutpat adipiscing.</p>
                                                <p>Proin ut urna enim.</p>
                                                <div className="text-right">
                                                    <small className="text-muted mr-2">Was this information useful?</small>
                                                    <button className="btn btn-secondary btn-xs" type="button">
                                                        <em className="fa fa-thumbs-up text-muted"></em>
                                                    </button>
                                                    <button className="btn btn-secondary btn-xs" type="button">
                                                        <em className="fa fa-thumbs-down text-muted"></em>
                                                    </button>
                                                </div>
                                            </CardBody>
                                        </Collapse>
                                    </Card>
                                </div>
                                : null}
                        {/*</CardBody>*/}
                    {/*</Card>*/}
                </Col>
            </Row>
        );
    }
}

export default ViewChecklist;

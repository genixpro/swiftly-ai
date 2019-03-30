import React from 'react';
import {Row, Col, Card, CardBody, CardHeader, Table, Button, CardTitle, Collapse } from 'reactstrap';

class ChecklistItem extends React.Component {
    state = {
        detailsOpen: false
    };


    componentDidMount()
    {
        if (this.props.completed)
        {

        }


        this.setState({

        })
    }


    toggleAccordion()
    {
        this.setState({detailsOpen: !this.state.detailsOpen});
    }


    render() {
        return (
            <Card className="checklist-item">
                <CardHeader onClick={() => this.toggleAccordion()}>
                    <CardTitle tag="h4">
                        <a className="text-inherit">
                            {
                                this.props.completed ?
                                    <small>
                                        <i className={"fa fa-check"}></i>
                                    </small> :
                                    <small>
                                        <i className={"fa fa-times"}></i>
                                    </small>
                            }
                            &nbsp;
                            &nbsp;
                            <span>{this.props.title}</span>
                        </a>
                    </CardTitle>
                </CardHeader>
                <Collapse isOpen={this.state.detailsOpen}>
                    <CardBody>
                        <p>{this.props.description}</p>
                    </CardBody>
                </Collapse>
            </Card>

        );
    }
}

export default ChecklistItem;

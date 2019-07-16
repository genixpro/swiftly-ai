import React from 'react';
import {Card, CardBody, CardHeader, CardTitle, Collapse } from 'reactstrap';

class ChecklistGroup extends React.Component {
    state = {
        detailsOpen: true
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
                        <span className={"checklist-group-title"}>{this.props.title}</span>
                        {
                            (this.props.fileNames ? this.props.fileNames : []).length > 0 ?
                                <span className={"checklist-spacer"}>&nbsp;-&nbsp;</span>
                                : null
                        }
                        {
                            (this.props.fileNames ? this.props.fileNames : []).map((name, nameIndex) =>
                            {
                                if (nameIndex < this.props.fileNames.length - 1)
                                {
                                    return <span className={"checklist-file-name"}>{name}, &nbsp;</span>;
                                }
                                else
                                {
                                    return <span className={"checklist-file-name"}>{name}</span>;
                                }
                            })
                        }
                        {/*</a>*/}
                    </CardTitle>
                </CardHeader>
                <Collapse isOpen={this.state.detailsOpen}>
                    <CardBody>
                        {/*<p>{this.props.description}</p>*/}
                        {this.props.children}
                    </CardBody>
                </Collapse>
            </Card>

        );
    }
}

export default ChecklistGroup;

import React from 'react';
import {Card, CardBody, CardHeader, CardTitle, Collapse} from 'reactstrap';

class ChecklistItem extends React.Component
{
    state = {};


    render()
    {
        return (
            <span>
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
                {/*&nbsp;-&nbsp;*/}
                {/*<span>{this.props.description}</span>*/}
                <br/>
            </span>

        );
    }
}

export default ChecklistItem;

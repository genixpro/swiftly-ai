import React from 'react';
import { Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Card, CardBody, CardHeader, CardText, CardTitle, FormGroup, Input,  Nav, NavItem, NavLink } from 'reactstrap';
import axios from 'axios';
import _ from 'underscore';
import LeaseFields from '../LeaseFields';
import { ContextMenu, MenuItem, ContextMenuTrigger, SubMenu } from "react-contextmenu";

class LeaseExtractionToken extends React.Component
{
    constructor()
    {
        super();

        this.state ={
            word: {},
            wordIndex: -1,
            selected: false
        };
    }

    componentDidMount()
    {
        this.setState({
            word: this.props.word,
            wordIndex: this.props.wordIndex
        })
    }

    onMouseDown()
    {
        this.props.onWordMouseDown(this.props.wordIndex);
        // this.setState({"selected": true});
    }

    onMouseUp()
    {
        // this.props.onWordMouseUp(this.props.wordIndex);
        // this.setState({"selected": false});
    }

    onHoverStart()
    {
        this.props.onWordHoverStart(this.props.wordIndex);
    }

    onHoverEnd()
    {
        this.props.onWordHoverEnd(this.props.wordIndex);
    }

    render() {
        const word = this.state.word;
        const wordIndex = this.state.wordIndex;
        return (
            <ContextMenuTrigger id="view-lease-word-menu" collect={() => {return {wordIndex}} }>
                <div className={`view-lease-word ${this.state.selected ? 'selected' : ''} ${this.state.word.classification !== "null" ? 'classified' : ''}`}
                     style={{"top": `${word.top*100}%`, "left": `${word.left*100}%`, "width": `${word.right*100 - word.left*100}%`, "height": `${word.bottom*100 - word.top*100}%`}}
                     onMouseEnter={this.onHoverStart.bind(this)}
                     onMouseLeave={this.onHoverEnd.bind(this)}
                     onMouseDown={this.onMouseDown.bind(this)}
                     onMouseUp={this.onMouseUp.bind(this)}

                />
        </ContextMenuTrigger>
        );
    }
}

export default LeaseExtractionToken;

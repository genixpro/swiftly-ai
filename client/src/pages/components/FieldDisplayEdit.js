import React from 'react';
import { Table } from 'reactstrap';
import _ from 'underscore';

import {
    Input,
    InputGroup,
    InputGroupAddon
} from 'reactstrap';

class FieldDisplayEdit extends React.Component
{
    state = {
        isEditing: false
    };

    constructor()
    {
        super();
        this.inputElem = null;
        this.sentUpdate = false;
    }

    componentDidMount()
    {

        if (this.props.hideIcon)
        {
            this.setState({hideIcon: true});
        }
        else
        {
            this.setState({hideIcon: false});
        }

        this.setState({value: this.formatValue(this.props.value)})
    }


    inputUpdated(newValue)
    {
        this.setState({value: newValue})
    }


    numberWithCommas(x)
    {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ", ");
    }


    formatValue(value)
    {
        if (value === "")
        {
            return "";
        }

        if (_.isUndefined(value))
        {
            return "";
        }

        else if (this.props.type === 'currency')
        {
            try {
                return "$" + this.numberWithCommas(Number(value).toFixed(2).toString());
            }
            catch(err) {
                return "$" + this.numberWithCommas(value.toString());
            }
        }
        else if (this.props.type === 'integer')
        {
            try {
                return this.numberWithCommas(Number(value).toFixed(0).toString());
            }
            catch(err) {
                return this.numberWithCommas(value.toString());
            }
        }
        return value;
    }


    cleanValue(value)
    {
        if (this.props.type === 'currency' || this.props.type === 'number')
        {
            const cleanText = value.toString().replace(/[^0-9\.-]/g, "");

            try {
                return Number(cleanText);
            }
            catch(err) {
                return 0;
            }
        }
        return value;
    }

    startEditing()
    {
        this.sentUpdate = false;
        this.setState({value: this.formatValue(this.props.value), isEditing: true})

    }


    finishEditing()
    {
        if (!this.sentUpdate)
        {
            this.sentUpdate = true;

            if (this.props.onChange)
            {
                this.setState({value: this.formatValue(this.cleanValue(this.state.value)) });
                this.props.onChange(this.cleanValue(this.state.value));
            }

            if (this.inputElem)
            {
                this.inputElem.blur();
            }
            this.setState({isEditing: false});
        }
    }


    handleKeyPress(e)
    {
        if (e.key === 'Enter') {
            this.finishEditing();
        }
    }


    render() {
        return (
            <InputGroup className={"field-display-edit " + (this.state.isEditing ? " editing" : "static") + " " + (this.props.className ? this.props.className : "")}
                        onClick={(evt) => this.startEditing()}
                        onBlur={(evt) => this.finishEditing()}>
                {
                    this.props.type === "textbox" ?
                        <textarea
                            placeholder={this.props.placeholder}
                            value={this.state.isEditing ? this.state.value : this.formatValue(this.props.value)}
                            onChange={(evt) => this.inputUpdated(evt.target.value)}
                            ref={(inputElem) => this.inputElem = inputElem}
                            onKeyPress={(evt) => this.handleKeyPress(evt)}
                            rows={1}
                        /> :
                        <Input placeholder={this.props.placeholder}
                               value={this.state.isEditing ? this.state.value : this.formatValue(this.props.value)}
                               onChange={(evt) => this.inputUpdated(evt.target.value)}
                               innerRef={(inputElem) => this.inputElem = inputElem}
                               onKeyPress={(evt) => this.handleKeyPress(evt)}
                        />
                }
                {
                    !this.state.hideIcon ?
                        <InputGroupAddon addonType="append">
                            <span className={"input-group-text"}>
                                <i className={"fa fa-wrench"} />
                            </span>
                        </InputGroupAddon> : null
                }
            </InputGroup>
        );
    }
}


export default FieldDisplayEdit;

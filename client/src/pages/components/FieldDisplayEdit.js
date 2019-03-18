import React from 'react';
import { Table } from 'reactstrap';
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


    componentDidMount()
    {
        this.setState({value: this.formatValue(this.props.value)})
    }


    inputUpdated(newValue)
    {
        this.setState({value: newValue})
    }

    formatValue(value)
    {
        if (this.props.type === 'currency')
        {
            try {
                return Number(value).toFixed(2);
            }
            catch(err) {
                return value;
            }
        }
        return value;
    }

    startEditing()
    {
        this.setState({value: this.formatValue(this.props.value), isEditing: true})

    }


    finishEditing()
    {
        if (this.props.onChange)
        {
            this.setState({value: this.formatValue(this.state.value)});
            this.props.onChange(this.state.value);
        }
        this.setState({isEditing: false});
    }


    render() {
        return (
            <div onClick={(evt) => this.startEditing()} onBlur={(evt) => this.finishEditing()}>
                <InputGroup className={"field-display-edit " + (this.state.isEditing ? " editing" : "static")}>
                    <Input placeholder={this.props.placeholder} value={this.state.isEditing ? this.state.value : this.formatValue(this.props.value)}
                           onChange={(evt) => this.inputUpdated(evt.target.value)} />
                    <InputGroupAddon addonType="append">
                        <span className={"input-group-text"}><i className={"fa fa-wrench"} /></span>
                    </InputGroupAddon>
                </InputGroup>
            </div>
        );
    }
}


export default FieldDisplayEdit;

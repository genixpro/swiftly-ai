import React from 'react';
import { FormGroup } from 'reactstrap';


class PropertyTypeSelector extends React.Component
{
    onChangeValue(newValue)
    {
        if (this.props.onChange)
        {
            this.props.onChange(newValue);
        }
    }

    render()
    {
        return (
            <select defaultValue="" className="custom-select mb-3" onClick={(evt) => this.onChangeValue(evt.target.value)} value={this.props.value}>
                <option value={"office"}>Office</option>
                <option value={"industrial"}>Industrial</option>
                <option value={"residential"}>Residential</option>
                <option value={"retail"}>Retail</option>
                <option value={"land"}>Land</option>
            </select>
        );
    }
}


export default PropertyTypeSelector;
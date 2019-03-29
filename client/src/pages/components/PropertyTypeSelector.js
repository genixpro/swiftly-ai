import React from 'react';
import { FormGroup } from 'reactstrap';


class PropertyTypeSelector extends React.Component
{
    onChangeValue(newValue)
    {
        if (this.props.onChange)
        {
            if (newValue !== this.props.value)
            {
                this.props.onChange(newValue);
            }
        }
    }

    onBlur()
    {
        if (this.props.onBlur)
        {
            this.props.onBlur();
        }
    }

    onRef(select)
    {
        if (this.props.innerRef)
        {
            this.props.innerRef(select);
        }
    }

    render()
    {
        return (
            <select
                defaultValue=""
                className="custom-select"
                onClick={(evt) => this.onChangeValue(evt.target.value)}
                onBlur={(evt) => this.onBlur()}
                ref={(ref) => this.onRef(ref)}
                value={this.props.value}
                disabled={this.props.disabled}

            >
                <option value={""}></option>
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
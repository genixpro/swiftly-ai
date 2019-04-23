import React from 'react';


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
                className="custom-select"
                onChange={(evt) => this.onChangeValue(evt.target.value)}
                onBlur={(evt) => this.onBlur()}
                ref={(ref) => this.onRef(ref)}
                value={this.props.value}
                title={this.props.title || this.props.placeholder}
                disabled={this.props.disabled}
                style={{"color": !this.props.value ? "lightgrey" : ""}}
            >
                {
                    this.props.isSearch ?
                        <option value={""}>All</option>
                        : <option value={""}>Property Type</option>
                }
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
import React from 'react';


class DirectComparisonMetricSelector extends React.Component
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
                <option value={""}>No Metric Selected</option>
                <option value={"psf"}>Per Square Foot</option>
                <option value={"psf_land"}>Per Square Foot of Land</option>
                <option value={"per_acre_land"}>Per Acre of Land</option>
                <option value={"psf_buildable_area"}>Per Square Foot of Buildable Area</option>
                <option value={"per_buildable_unit"}>Per Buildable Unit</option>
            </select>
        );
    }
}


export default DirectComparisonMetricSelector;
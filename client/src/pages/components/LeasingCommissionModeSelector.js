import React from 'react';


class LeasingComissionModeSelector extends React.Component
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
                <option value={"psf"}>psf</option>
                <option value={"percent_of_rent"}>% of rent</option>
            </select>
        );
    }
}


export default LeasingComissionModeSelector;
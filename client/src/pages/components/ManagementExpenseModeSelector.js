import React from 'react';


class ManagementExpenseModeSelector extends React.Component
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
                disabled={this.props.disabled}
                title={this.props.title || this.props.placeholder}
                style={{"color": !this.props.value ? "lightgrey" : ""}}
            >
                <option value={"income_statement"}>Base on Expense Statement</option>
                <option value={"rule"}>Base on Industry Rate</option>
                <option value={"combined_structural_rule"}>Combine with Structural Allowance</option>
            </select>
        );
    }
}


export default ManagementExpenseModeSelector;
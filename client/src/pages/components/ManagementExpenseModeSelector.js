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

    allowOption(option)
    {
        if (this.props.exclude && this.props.exclude.indexOf(option) !== -1)
        {
            return false;
        }
        return true;
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
                {
                    this.allowOption("income_statement") ?
                        <option value={"income_statement"}>Base on Expense Statement</option>
                        : null
                }
                {
                    this.allowOption("rule") ?
                        <option value={"rule"}>Base on Industry Rate</option>
                        : null
                }
                {
                    this.allowOption("combined_structural_rule") ?
                        <option value={"combined_structural_rule"}>Combine with Structural Allowance</option>
                        : null
                }
            </select>
        );
    }
}


export default ManagementExpenseModeSelector;
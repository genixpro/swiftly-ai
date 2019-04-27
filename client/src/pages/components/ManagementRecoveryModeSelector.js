import React from 'react';


class ManagementRecoveryModeSelector extends React.Component
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
                <option value={"none"}>No Management Recovery</option>
                <option value={"operatingExpenses"}>Operating Expenses</option>
                <option value={"operatingExpensesAndTaxes"}>Operating Expenses & Taxes</option>
                <option value={"managementExpenses"}>Management Expenses</option>
                <option value={"custom"}>Custom</option>
            </select>
        );
    }
}


export default ManagementRecoveryModeSelector;
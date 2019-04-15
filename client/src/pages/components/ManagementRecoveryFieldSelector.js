import React from 'react';
import { FormGroup } from 'reactstrap';


class ManagementRecoveryFieldSelector extends React.Component
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
                style={{"color": !this.props.value ? "lightgrey" : ""}}
            >
                <option value={""}>&nbsp;</option>
                <option value={"operatingExpenses"}>Operating Expenses</option>
                <option value={"managementExpenses"}>Management Expenses</option>
                <option value={"rentalIncome"}>Rental Income</option>
            </select>
        );
    }
}


export default ManagementRecoveryFieldSelector;

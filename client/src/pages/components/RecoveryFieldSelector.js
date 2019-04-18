import React from 'react';


class RecoveryFieldSelector extends React.Component
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
        if (!this.props.expenses)
        {
            return null;
        }

        const options = [
            <option value={""} key={"blank"}>&nbsp;</option>,
            <option value={"operatingExpenses"} key={"operatingExpenses"}>Operating Expenses</option>,
            <option value={"managementExpenses"} key={"managementExpenses"}>Management Expenses</option>,
            <option value={"rentalIncome"} key={"rentalIncome"}>Rental Income</option>
        ].concat(
            this.props.expenses.map((expense) =>
            {
                return <option key={expense.name} value={expense.name}>{expense.name}</option>
            }));

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
                {options}
            </select>
        );
    }
}


export default RecoveryFieldSelector;

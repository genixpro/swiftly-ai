import React from 'react';
import { FormGroup } from 'reactstrap';


class IncomeItemTypeSelector extends React.Component
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
                {
                    (this.props.cashFlowType === 'income' || !this.props.cashFlowType) ?
                        <option value={""}>Income Type</option>
                        : null
                }
                {
                    (this.props.cashFlowType === 'expense') ?
                        <option value={""}>Expense Type</option>
                        : null
                }

                {
                    (this.props.cashFlowType === 'income'  || !this.props.cashFlowType) ?
                        [
                            <option key={"rental_income"} value={"rental_income"}>Rental Income</option>,
                            <option key={"additional_income"} value={"additional_income"}>Additional Income</option>,
                            <option key={"expense_recovery"} value={"expense_recovery"}>Expense Recoveries</option>
                        ] : null
                }

                {
                    (this.props.cashFlowType === 'expense'  || !this.props.cashFlowType) ?
                        [
                            <option key={"operating_expense"} value={"operating_expense"}>Operating Expense</option>,
                            <option key={"non_recoverable_expense"} value={"non_recoverable_expense"}>Non Recoverable Expense</option>,
                            <option key={"taxes"} value={"taxes"}>Taxes</option>,
                            <option key={"management_expense"} value={"management_expense"}>Management Expense</option>,
                            <option key={"structural_allowance"} value={"structural_allowance"}>Structural Allowance</option>
                        ] : null
                }
                <option key={"unknown"} value={"unknown"}>Unknown</option>
            </select>
        );
    }
}



export default IncomeItemTypeSelector;
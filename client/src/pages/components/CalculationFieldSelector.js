import React from 'react';


class CalculationFieldSelector extends React.Component
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
            <option value={"operatingExpenses"} key={"operatingExpenses"}>{nameForCalculationField("operatingExpenses")}</option>,
            <option value={"operatingExpensesAndTaxes"} key={"operatingExpensesAndTaxes"}>{nameForCalculationField("operatingExpensesAndTaxes")}</option>,
            <option value={"managementExpenses"} key={"managementExpenses"}>{nameForCalculationField("managementExpenses")}</option>,
            <option value={"taxes"} key={"taxes"}>{nameForCalculationField("taxes")}</option>,
            <option value={"effectiveGrossIncome"} key={"effectiveGrossIncome"}>{nameForCalculationField("effectiveGrossIncome")}</option>,
            <option value={"rentalIncome"} key={"rentalIncome"}>{nameForCalculationField("rentalIncome")}</option>
        ];

        // .concat(
        //     this.props.expenses.map((expense) =>
        //     {
        //         return <option key={expense.name} value={expense.name}>{expense.name}</option>
        //     }));

        return (
            <select
                className="custom-select"
                title={this.props.title || this.props.placeholder}
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

function nameForCalculationField(calculationField)
{
    if (calculationField === "operatingExpenses")
    {
        return "Operating Expenses";
    }
    if (calculationField === "operatingExpensesAndTaxes")
    {
        return "Operating Expenses & Taxes";
    }
    if (calculationField === "managementExpenses")
    {
        return "Management Expenses";
    }
    if (calculationField === "taxes")
    {
        return "Taxes";
    }
    if (calculationField === "effectiveGrossIncome")
    {
        return "Effective Gross Income";
    }
    if (calculationField === "rentalIncome")
    {
        return "Rental Income";
    }
    return "";
}




export default CalculationFieldSelector;
export {CalculationFieldSelector, nameForCalculationField}
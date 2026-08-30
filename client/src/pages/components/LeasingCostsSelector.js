import React from 'react';


class LeasingCostSelector extends React.Component
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
        if (!this.props.leasingCostStructures)
        {
            return null;
        }

        const options = [
            <option value={""} key={"blank"}>No Leasing Costs</option>
        ].concat(
            this.props.leasingCostStructures.map((rent, index) =>
            {
                return <option key={index} value={rent.name}>{rent.name}</option>
            }));

        return (
            <select
                className="custom-select"
                onChange={(evt) => this.onChangeValue(evt.target.value)}
                onBlur={(evt) => this.onBlur()}
                title={this.props.title || this.props.placeholder}
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


export default LeasingCostSelector;

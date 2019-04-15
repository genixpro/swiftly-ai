import React from 'react';
import { FormGroup } from 'reactstrap';


class MarketRentSelector extends React.Component
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
        if (!this.props.marketRents)
        {
            return null;
        }

        const options = [
            <option value={""} key={"blank"}>Market Rent</option>
        ].concat(
            this.props.marketRents.map((rent) =>
            {
                return <option key={rent.name} value={rent.name}>{rent.name}</option>
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


export default MarketRentSelector;

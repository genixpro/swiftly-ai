import React from 'react';


class IndustrialSubtypeSelector extends React.Component
{
    onChangeValue(newValue)
    {
        if (this.props.onChange)
        {
            this.props.onChange(newValue);
        }
    }

    render()
    {
        return (
            <select defaultValue="" className="custom-select mb-3" onClick={(evt) => this.onChangeValue(evt.target.value)} value={this.props.value}
                    title={this.props.title || this.props.placeholder}>
                <option value={"single_tenant"}>Single Tenant</option>
                <option value={"multi_tenant"}>Multi Tenant</option>
            </select>
        );
    }
}


export default IndustrialSubtypeSelector;

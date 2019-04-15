import React from 'react';


class LandSubtypeSelector extends React.Component
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
            <select defaultValue="" className="custom-select mb-3" onClick={(evt) => this.onChangeValue(evt.target.value)} value={this.props.value}>
                <option value={"residential"}>Residential Land</option>
                <option value={"commercial"}>Commercial Land</option>
            </select>
        );
    }
}


export default LandSubtypeSelector;

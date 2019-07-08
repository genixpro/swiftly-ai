import React from 'react';
import AsyncCreatable from 'react-select/lib/AsyncCreatable';
import axios from "axios/index";
import ZoneModel from "../../models/ZoneModel";
import {regularizeId} from "../../orm/IdField";


class ZoneSelector extends React.Component {
    state = {
        selectedOption: null,
    };

    componentDidMount()
    {
        if (this.props.value)
        {
            axios.get(`/zone/${this.props.value}`).then((response) =>
            {
                this.setState({zone: {value: regularizeId(response.data.zone._id), label: response.data.zone.zoneName}})
            });
        }
    }

    onCreateZone(data)
    {
        axios.post(`/zones`, {zoneName: data, description: ""}).then((response) =>
        {
            this.setState({zone: {value: regularizeId(response.data._id), label: data}});
            this.props.onChange(regularizeId(response.data._id));
        });
    }

    loadOptions(inputValue, callback)
    {
        if (inputValue)
        {
            axios.get(`/zones`, {params: {zoneName: inputValue}}).then((response) =>
            {
                callback(response.data.zones.map((zone) => ({value: regularizeId(zone._id), label: zone.zoneName}) ));
            });
        }
        else
        {
            callback([]);
        }
    }

    onChange(newZone)
    {
        if (this.props.onChange)
        {
            if (newZone)
            {
                this.props.onChange(newZone.value);
                this.setState({zone: newZone});
            }
            else
            {
                this.props.onChange(null);
                this.setState({zone: null});
            }
        }
    }

    render()
    {
        // const { selectedOption } = this.state;

        return (
            <AsyncCreatable
                className={"zone-selector"}
                classNamePrefix={"zone-selector"}
                value={this.state.zone}
                cacheOptions
                isClearable={true}
                title={this.props.title || this.props.placeholder}
                loadOptions={this.loadOptions}
                onCreateOption={(data) => this.onCreateZone(data)}
                noOptionsMessage={() => <span>Search for a Zone</span>}
                defaultOptions
                onChange={(data) => this.onChange(data)}
                onBlur={this.props.onBlur}
            />
        );
    }
}



export default ZoneSelector;


import React from 'react';
import Select from 'react-select';
import AsyncCreatable from 'react-select/lib/AsyncCreatable';
import FileModel from "../../models/FileModel";
import axios from "axios/index";


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
                this.setState({zone: {value: response.data.zone._id['$oid'], label: response.data.zone.zoneName}})
            });
        }
    }

    onCreateZone(data)
    {
        axios.post(`/zones`, {zoneName: data, description: ""}).then((response) =>
        {
            this.setState({zone: {value: response.data._id, label: data}});
            this.props.onChange(response.data._id);
        });
    }

    loadOptions(inputValue, callback)
    {
        if (inputValue)
        {
            axios.get(`/zones`, {params: {zoneName: inputValue}}).then((response) =>
            {
                callback(response.data.zones.map((zone) => ({value: zone._id['$oid'], label: zone.zoneName}) ));
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
            this.props.onChange(newZone.value);
            this.setState({zone: newZone});
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

import React from 'react';
import AsyncCreatable from 'react-select/async-creatable';
import {zonesApi} from '@api/resources';
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
            zonesApi.get(this.props.value).then((zone) =>
            {
                this.setState({zone: {value: regularizeId(zone._id), label: zone.zoneName}})
            });
        }
    }

    onCreateZone(data)
    {
        zonesApi.create({zoneName: data, description: ""}).then((zoneId) =>
        {
            this.setState({zone: {value: regularizeId(zoneId), label: data}});
            this.props.onChange(regularizeId(zoneId));
        });
    }

    loadOptions(inputValue, callback)
    {
        if (inputValue)
        {
            zonesApi.list(inputValue).then((zones) =>
            {
                callback(zones.map((zone) => ({value: regularizeId(zone._id), label: zone.zoneName}) ));
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
                value={this.state.zone ?? ""}
                cacheOptions
                isClearable={true}
                title={this.props.title || this.props.placeholder}
                aria-label={this.props.title || this.props.placeholder || "Zoning"}
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

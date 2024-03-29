import React from 'react';
import AsyncCreatable from 'react-select/lib/AsyncCreatable';
import axios from "axios/index";


class TenantNameSelector extends React.Component {
    state = {
        selectedOption: null,
    };

    loadOptions(inputValue, callback)
    {
        if (inputValue)
        {
            axios.get(`/tenant_names`, {params: {tenantName: inputValue}}).then((response) =>
            {
                callback(response.data.names.map((tenant) => ({value: tenant, label: tenant}) ));
            });
        }
        else
        {
            callback([]);
        }
    }

    onCreateTenant(name)
    {
        this.setState({tenant: {value: name, label: name}});
        this.props.onChange(name);
    }

    onChange(newTenant)
    {
        if (this.props.onChange)
        {
            if (newTenant)
            {
                this.props.onChange(newTenant.value);
                this.setState({tenant: newTenant});
            }
            else
            {
                this.props.onChange(null);
                this.setState({tenant: null});
            }
        }
    }

    render()
    {
        // const { selectedOption } = this.state;

        return (
            <AsyncCreatable
                className={"tenant-name-selector"}
                classNamePrefix={"tenant-name-selector"}
                value={this.state.tenant ? this.state.tenant : this.props.value ? {value: this.props.value, label: this.props.value} : null}
                cacheOptions
                isClearable={true}
                title={this.props.title || this.props.placeholder}
                loadOptions={this.loadOptions.bind(this)}
                onCreateOption={(data) => this.onCreateTenant(data)}
                noOptionsMessage={() => <span>Search for a Tenant</span>}
                formatCreateLabel={(value) => <span>{value}</span>}
                onChange={(data) => this.onChange(data)}
                onBlur={this.props.onBlur}
            />
        );
    }
}



export default TenantNameSelector;

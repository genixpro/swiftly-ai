import React from 'react';
import type {ComponentType, FocusEventHandler} from 'react';
import AsyncCreatableRaw from 'react-select/async-creatable';
import {useTenantNameSearch} from '@api/hooks';

interface TenantOption {
    label: string;
    value: string;
}

interface TenantAsyncCreatableProps {
    cacheOptions?: boolean;
    className?: string;
    classNamePrefix?: string;
    formatCreateLabel?(value: string): React.ReactNode;
    isClearable?: boolean;
    loadOptions(inputValue: string, callback: (options: TenantOption[]) => void): void;
    noOptionsMessage?(): React.ReactNode;
    onBlur?: FocusEventHandler<HTMLElement>;
    onChange?(value: TenantOption | null): void;
    onCreateOption?(value: string): void;
    title?: string;
    value?: TenantOption | null;
}

const AsyncCreatable = AsyncCreatableRaw as unknown as ComponentType<TenantAsyncCreatableProps>;

interface TenantNameSelectorProps {
    disabled?: boolean;
    innerRef?: (inputElement: HTMLElement | null) => void;
    onBlur?: FocusEventHandler<HTMLElement>;
    onChange(value: string | null): void;
    placeholder?: string;
    title?: string;
    value?: string | null;
}

function TenantNameSelector(props: TenantNameSelectorProps) {
    const [state, setState] = React.useState<{selectedOption: null; tenant?: TenantOption | null}>({selectedOption: null});
    const searchTenantNames = useTenantNameSearch();
    const loadOptions = (inputValue: string, callback: (options: TenantOption[]) => void) => {
        if (inputValue)
        {
            searchTenantNames(inputValue).then((names) =>
            {
                callback(names.map((tenant) => ({value: tenant, label: tenant}) ));
            });
        }
        else
        {
            callback([]);
        }
    };
    const onCreateTenant = (name: string) => {
        setState((currentState) => ({...currentState, tenant: {value: name, label: name}}));
        props.onChange(name);
    };
    const onChange = (newTenant: TenantOption | null) => {
        if (props.onChange)
        {
            if (newTenant)
            {
                props.onChange(newTenant.value);
                setState((currentState) => ({...currentState, tenant: newTenant}));
            }
            else
            {
                props.onChange(null);
                setState((currentState) => ({...currentState, tenant: null}));
            }
        }
    };

        // const { selectedOption } = this.state;

        return (
            <AsyncCreatable
                className={"tenant-name-selector"}
                classNamePrefix={"tenant-name-selector"}
                value={state.tenant ? state.tenant : props.value ? {value: props.value, label: props.value} : null}
                cacheOptions
                isClearable={true}
                title={props.title || props.placeholder}
                loadOptions={loadOptions}
                onCreateOption={onCreateTenant}
                noOptionsMessage={() => <span>Search for a Tenant</span>}
                formatCreateLabel={(value: string) => <span>{value}</span>}
                onChange={onChange}
                onBlur={props.onBlur}
            />
        );
}



export default TenantNameSelector;

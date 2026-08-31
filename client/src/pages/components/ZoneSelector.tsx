import type {ComponentType, FocusEventHandler} from 'react';
import {useEffect, useRef, useState} from 'react';
import AsyncCreatableRaw from 'react-select/async-creatable';
import {useCreateZone, useZone, useZoneSearch} from '@api/hooks';
import {regularizeId} from "../../domain/ids";

interface ZoneOption {
    label?: string;
    value: string | null | undefined;
}

interface ZoneAsyncCreatableProps {
    'aria-label'?: string;
    cacheOptions?: boolean;
    className?: string;
    classNamePrefix?: string;
    defaultOptions?: boolean;
    isClearable?: boolean;
    loadOptions(inputValue: string, callback: (options: ZoneOption[]) => void): void;
    noOptionsMessage?(): React.ReactNode;
    onBlur?: FocusEventHandler<HTMLElement>;
    onChange?(value: ZoneOption | string | null): void;
    onCreateOption?(value: string): void;
    title?: string;
    value?: ZoneOption | string | null;
}

const AsyncCreatable = AsyncCreatableRaw as unknown as ComponentType<ZoneAsyncCreatableProps>;

interface ZoneSelectorProps {
    disabled?: boolean;
    onBlur?: FocusEventHandler<HTMLElement>;
    onChange(id: string | null | undefined): void;
    placeholder?: string;
    title?: string;
    value?: string | null;
}

function ZoneSelector(props: ZoneSelectorProps) {
    const [state, setState] = useState<{selectedOption: null; zone?: ZoneOption | null}>({selectedOption: null});
    const initialValueRef = useRef(props.value);
    const initialZoneAppliedRef = useRef(false);
    const initialZoneQuery = useZone(initialValueRef.current ?? '');
    const createZone = useCreateZone();
    const searchZones = useZoneSearch();
    useEffect(() => {
        if (initialValueRef.current && initialZoneQuery.data && !initialZoneAppliedRef.current)
        {
            initialZoneAppliedRef.current = true;
            setState((currentState) => ({...currentState, zone: {value: regularizeId(initialZoneQuery.data._id), label: initialZoneQuery.data.zoneName}}));
        }
    }, [initialZoneQuery.data]);

    const onCreateZone = (data: string) => {
        createZone.mutateAsync({zoneName: data, description: ""}).then((zoneId) =>
        {
            setState((currentState) => ({...currentState, zone: {value: regularizeId(zoneId), label: data}}));
            props.onChange(regularizeId(zoneId));
        });
    };
    const loadOptions = (inputValue: string, callback: (options: ZoneOption[]) => void) => {
        if (inputValue)
        {
            searchZones(inputValue).then((zones) =>
            {
                callback(zones.map((zone) => ({value: regularizeId(zone._id), label: zone.zoneName}) ));
            });
        }
        else
        {
            callback([]);
        }
    };
    const onChange = (newZone: ZoneOption | null) => {
        if (props.onChange)
        {
            if (newZone)
            {
                props.onChange(newZone.value);
                setState((currentState) => ({...currentState, zone: newZone}));
            }
            else
            {
                props.onChange(null);
                setState((currentState) => ({...currentState, zone: null}));
            }
        }
    };

        // const { selectedOption } = this.state;

        return (
            <AsyncCreatable
                className={"zone-selector"}
                classNamePrefix={"zone-selector"}
                value={state.zone ?? ""}
                cacheOptions
                isClearable={true}
                title={props.title || props.placeholder}
                aria-label={props.title || props.placeholder || "Zoning"}
                loadOptions={loadOptions}
                onCreateOption={onCreateZone}
                noOptionsMessage={() => <span>Search for a Zone</span>}
                defaultOptions
                onChange={(data) => onChange(typeof data === 'string' ? {value: data, label: data} : data)}
                onBlur={props.onBlur}
            />
        );
}



export default ZoneSelector;

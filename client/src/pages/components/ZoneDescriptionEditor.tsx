import {useEffect, useState} from 'react';
import FieldDisplayEdit from "./FieldDisplayEdit";
import {useUpdateZone, useZone} from '@api/hooks';
import type {ZoneDTO} from '@api/types';

interface ZoneDescriptionEditorProps {
    zoneId: string;
}

function ZoneDescriptionEditor(props: ZoneDescriptionEditorProps) {
    const [state, setState] = useState<{zone: Partial<ZoneDTO>}>({zone: {}});
    const zoneQuery = useZone(props.zoneId);
    const updateZone = useUpdateZone(props.zoneId);
    const changeZoneDescription = (newValue: string) => {
        const zone = state.zone;
        zone.description = newValue;
        setState({zone: zone});
        updateZone.mutate(zone);
    };

    useEffect(() => {
        if (props.zoneId !== state.zone._id && zoneQuery.data)
        {
            setState({zone: {...zoneQuery.data}})
        }
    }, [props.zoneId, state.zone._id, zoneQuery.data]);

        return (
            <FieldDisplayEdit
                type={"textbox"}
                edit={true}
                placeholder={"Zone Description"}
                value={state.zone.description}
                onChange={changeZoneDescription}
            />
        );
}



export default ZoneDescriptionEditor;

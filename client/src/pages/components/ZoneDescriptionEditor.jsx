import React from 'react';
import FieldDisplayEdit from "./FieldDisplayEdit";
import {zonesApi} from '@api/resources';
import ZoneModel from "../../models/ZoneModel";


class ZoneDescriptionEditor extends React.Component {
    state = {
        zone: {}
    };

    componentDidMount()
    {
        if (this.props.zoneId)
        {
            this.reloadZone();
        }
    }

    reloadZone()
    {
        zonesApi.get(this.props.zoneId).then((zone) =>
        {
            this.setState({zone: ZoneModel.create(zone)})
        });
    }

    componentDidUpdate()
    {
        if (this.props.zoneId !== this.state.zone._id)
        {
            this.reloadZone();
        }
    }


    changeZoneDescription(newValue)
    {
        const zone = this.state.zone;
        zone.description = newValue;
        this.setState({zone: zone});
        zonesApi.update(this.props.zoneId, zone);
    }


    render()
    {
        return (
            <FieldDisplayEdit
                type={"textbox"}
                edit={true}
                placeholder={"Zone Description"}
                value={this.state.zone.description}
                onChange={(newValue) => this.changeZoneDescription(newValue)}
            />
        );
    }
}



export default ZoneDescriptionEditor;

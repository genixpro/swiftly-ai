import React from 'react';
import Select from 'react-select';
import AsyncCreatable from 'react-select/lib/AsyncCreatable';
import FieldDisplayEdit from "./FieldDisplayEdit";
import axios from "axios/index";
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
        axios.get(`/zone/${this.props.zoneId}`).then((response) =>
        {
            this.setState({zone: new ZoneModel(response.data.zone)})
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
        axios.post(`/zone/${this.props.zoneId}`, zone).then((response) =>
        {
            // this.setState({zone: response.data.zone})
        });
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

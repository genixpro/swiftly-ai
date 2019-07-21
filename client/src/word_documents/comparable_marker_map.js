import React from 'react'
import {mean} from "./stats";
import proxy from "../proxy";

class ComparableMarkerMap extends React.Component {
    render()
    {
        // let averageLat = mean(this.props.comparableSales.filter((comp) => comp.location).map((comp) => comp.location.coordinates[1]));
        // let averageLng = mean(this.props.comparableSales.filter((comp) => comp.location).map((comp) => comp.location.coordinates[0]));


        let url = `https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyBRmZ2N4EhJjXmC29t3VeiLUQssNG-MY1I&size=640x480`;

        this.props.comparableSales.forEach((comp, compIndex) =>
        {
            url += `&markers=color:orange`;
            url += `%7Clabel:${compIndex + 1}`;
            url += `%7C${comp.location.coordinates[1]},${comp.location.coordinates[0]}`;
        });

        if (this.props.appraisal.location)
        {
            url += `&markers=color:blue`;
            url += `%7Clabel:S`;
            url += `%7C${this.props.appraisal.location.coordinates[1]},${this.props.appraisal.location.coordinates[0]}`;
        }

        return (
            <img src={proxy(url)} />
        )
    }
}

export default ComparableMarkerMap;



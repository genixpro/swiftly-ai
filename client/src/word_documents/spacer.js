import React from 'react'
import { renderToString } from 'react-dom/server'
import readJSONInput from "./read_json_input";
import fs from "fs";
import Moment from 'react-moment';
import _ from "underscore";
import NumberFormat from 'react-number-format';

class Spacer extends React.Component {
    render()
    {
        return <span> </span>;
    }
}

export {Spacer};

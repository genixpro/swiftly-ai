
import React from 'react'
import { renderToString } from 'react-dom/server'
import readJSONInput from "./read_json_input";
import fs from "fs";
import Moment from 'react-moment';
import _ from "underscore";
import NumberFormat from 'react-number-format';


class FieldsTable extends React.Component {
    render()
    {
        const tableStyle = {
            "width": "6in"
        };

        const fieldLabelStyle = {
            "width": "2in",
            "fontWeight": "bold"
        };

        const spacerStyle = {
            "marginLeft": "0.25in"
        };

        const fieldValueStyle = {
            "width": "4in",
            "fontWeight": "bold"
        };


        return (
            <table cellSpacing={0} style={tableStyle}>
                <tbody>
                {
                    Object.keys(this.props.fields).map((field, fieldIndex) =>
                    {
                        if (_.isUndefined(this.props.value[field]) || _.isNull(this.props.value[field]))
                        {
                            return null;
                        }

                        return <tr key={fieldIndex}>
                            <td style={fieldLabelStyle} width="30%">
                                {this.props.friendlyNames[field]}
                            </td>
                            <td width="10%"><span style={spacerStyle}>:</span></td>
                            <td style={fieldValueStyle} width="60%">
                                {this.props.fields[field](this.props.value[field])}
                            </td>
                        </tr>
                    })
                }
                </tbody>
            </table>
        )
    }
}

export default FieldsTable;

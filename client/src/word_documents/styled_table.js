import React from 'react'
import { renderToString } from 'react-dom/server'
import readJSONInput from "./read_json_input";
import fs from "fs";
import Moment from 'react-moment';
import _ from "underscore";
import NumberFormat from 'react-number-format';

var flattenObject = function(ob) {
    var toReturn = {};

    for (var i in ob) {
        if (!ob.hasOwnProperty(i)) continue;

        if ((typeof ob[i]) == 'object') {
            var flatObject = flattenObject(ob[i]);
            for (var x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;

                toReturn[i + '.' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = ob[i];
        }
    }
    return toReturn;
};

class Row extends React.Component
{
    render()
    {
        let fontSize = this.props.fontSize ? `${this.props.fontSize}px` : '';

        const tableBodyStyle = {
            "borderLeft": "0px solid lightgrey",
            "borderRight": "0px solid lightgrey",
            "borderBottom": "1px solid lightgrey",
            "backgroundColor": "#FFFDF3",
            "color": "black",
            "fontSize": fontSize,
            "paddingBottom": "2px",
            "marginBottom": "2px",
            "paddingTop": "2px",
            "marginTop": "2px"
        };

        if (this.props.total)
        {
            tableBodyStyle['fontWeight'] = "bold";
        }

        const tableBodyStyleLeft = _.extend({}, tableBodyStyle, {"borderLeft": "2px solid lightgrey"});

        const tableBodyStyleRight = _.extend({}, tableBodyStyle, {"borderRight": "2px solid lightgrey"});


        const tableBottomStyle = _.extend({}, tableBodyStyle, {
            "borderTop": "0px solid lightgrey",
            "borderBottom": "2px solid lightgrey"
        });

        const tableBottomStyleLeft = _.extend({}, tableBottomStyle, {"borderLeft": "2px solid lightgrey"});

        const tableBottomStyleRight = _.extend({}, tableBottomStyle, {"borderRight": "2px solid lightgrey"});

        const row = flattenObject(this.props.row);

        let style = tableBodyStyle;
        let styleLeft = tableBodyStyleLeft;
        let styleRight = tableBodyStyleRight;

        if (this.props.isLast)
        {
            style = tableBottomStyle;
            styleLeft = tableBottomStyleLeft;
            styleRight = tableBottomStyleRight;
        }

        return <tr key={this.props.index}>
            {
                Object.keys(this.props.fields).map((key, keyIndex) =>
                {
                    if (keyIndex === 0)
                    {
                        return <td key={keyIndex} style={styleLeft} width={this.props.columnSizes[keyIndex]}>
                            {this.props.fields[key](row[key], row, this.props.rowIndex)}
                        </td>
                    }
                    else if (keyIndex === (Object.keys(this.props.fields).length - 1))
                    {
                        return <td key={keyIndex} style={styleRight} width={this.props.columnSizes[keyIndex]}>
                            {this.props.fields[key](row[key], row, this.props.rowIndex)}
                        </td>
                    }
                    else
                    {
                        return <td key={keyIndex} style={style} width={this.props.columnSizes[keyIndex]}>
                            {this.props.fields[key](row[key], row, this.props.rowIndex)}
                        </td>
                    }
                })
            }
        </tr>
        }
}


class StyledTable extends React.Component {
    render()
    {
        const tableStyle = {
            "color": "white"
        };

        let fontSize = this.props.fontSize ? `${this.props.fontSize}px` : '';

        let columnSizes = this.props.columnSizes ? this.props.columnSizes : this.props.headers.map((header) => `10%`);

        const tableHeaderStyle = {
            "border": "1px solid lightgrey",
            "borderTop": "2px solid lightgrey",
            "backgroundColor": "#bcbcbc",
            "color": "black",
            "textAlign": "center",
            "fontWeight": "bold",
            "verticalAlign": "bottom",
            "fontSize": fontSize
        };

        const tableHeaderLeftStyle = _.extend({}, tableHeaderStyle, {"borderLeft": "2px solid lightgrey"});

        const tableHeaderRightStyle = _.extend({}, tableHeaderStyle, {"borderRight": "2px solid lightgrey"});

        const leftAlign = (style) => _.extend({}, style, {"textAlign": "left"});
        const rightAlign = (style) => _.extend({}, style, {"textAlign": "right"});

        const rows = this.props.rows || [];

        return (
            <center>
                <table style={tableStyle} cellSpacing={0}>
                    <thead>
                    <tr>
                        {
                            this.props.headers.map((header, index) =>
                            {
                                if (index === 0)
                                {
                                    return <td key={index} style={tableHeaderLeftStyle} width={columnSizes[index]}>
                                        {header}
                                    </td>
                                }
                                else if (index === this.props.headers.length -1)
                                {
                                    return <td key={index} style={tableHeaderRightStyle} width={columnSizes[index]}>
                                        {header}
                                    </td>
                                }
                                else
                                {
                                    return <td key={index} style={tableHeaderStyle} width={columnSizes[index]}>
                                        {header}
                                    </td>
                                }

                            })
                        }
                    </tr>
                    </thead>
                    <tbody>
                    {
                        rows.map((baseRow, rowIndex) =>
                        {
                            return <Row
                                key={rowIndex}
                                rowIndex={rowIndex}
                                row={baseRow}
                                fields={this.props.fields}
                                index={rowIndex}
                                isLast={rowIndex === (this.props.rows.length-1)}
                                fontSize={this.props.fontSize}
                                columnSizes={columnSizes}
                            />
                        })
                    }
                    {
                        this.props.totals ? this.props.totals.map((row, rowIndex) =>
                        {
                            return <Row
                                key={rowIndex}
                                total
                                row={row}
                                fields={this.props.fields}
                                index={rowIndex}
                                isLast={rowIndex === (this.props.rows.length-1)}
                                fontSize={this.props.fontSize}
                                columnSizes={columnSizes}
                            />
                        }) : null
                    }
                    </tbody>
                </table>
            </center>
        )
    }
}

export default StyledTable;

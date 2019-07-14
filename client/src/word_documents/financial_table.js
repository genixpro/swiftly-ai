import React from 'react'
import { renderToString } from 'react-dom/server'
import readJSONInput from "./read_json_input";
import fs from "fs";
import Moment from 'react-moment';
import _ from "underscore";
import NumberFormat from 'react-number-format';

class Row extends React.Component
{
    render()
    {
        const fontSize = this.props.fontSize ? `${this.props.fontSize}px` : "9px";

        const headerStyle = {
            "textAlign": "center"
        };

        const subHeaderStyle = {
            "textAlign": "center"
        };

        const tableStyle = {
            // "marginLeft": "1in",
            "border": "0px solid white"
        };

        const titleRowStyle = {
            "border": "0px solid white",

        };

        const dataRowStyle = {
            "border": "0px solid white"
        };

        const sumAfterDataRowStyle = {

        };

        const sumDataRowStyle = {

        };

        const totalSumDataRowStyle = {

        };


        const labelColumnStyle = {
            "border": "0px solid white"
        };

        const amountColumnStyle = {
            "border": "0px solid white"
        };

        const amountTotalColumnStyle = {
            "border": "0px solid white"
        };

        const labelSpanStyle = {
            "marginBottom": "0px",
            "fontFamily": "monospace, serif",
            "fontSize": fontSize,
            "textAlign": "center",
            "whiteSpace": "nowrap"
        };

        const amountSpanStyle = {
            "marginBottom": "0px",
            "paddingLeft": "20px",
            "textAlign": "center",
            "fontFamily": "monospace, serif",
            "fontSize": fontSize,
            "whiteSpace": "nowrap"
        };

        const amountTotalSpanStyle = {
            "marginBottom": "0px",
            "paddingLeft": "20px",
            "textAlign": "center",
            "fontFamily": "monospace, serif",
            "fontSize": fontSize,
            "whiteSpace": "nowrap"
        };

        const titleLabelColumnStyle = _.extend({}, labelColumnStyle, {

        });

        const titleAmountColumnStyle = _.extend({}, amountColumnStyle, {

        });

        const titleAmountTotalColumnStyle = _.extend({}, amountTotalColumnStyle, {

        });

        const titleLabelSpanStyle = _.extend({}, labelSpanStyle, {
            "marginTop": "25px",
            "fontWeight": "bold"
        });

        const titleAmountSpanStyle = _.extend({}, amountSpanStyle, {
            "marginTop": "25px",
            "fontWeight": "bold",
            "color": "black"
        });

        const titleAmountTotalSpanStyle = _.extend({}, amountTotalSpanStyle, {
            "marginTop": "25px",
            "fontWeight": "bold",
            "color": "black"
        });

        const dataLabelColumnStyle = _.extend({}, labelColumnStyle, {

        });

        const dataAmountColumnStyle = _.extend({}, amountColumnStyle, {

        });

        const dataAmountTotalColumnStyle = _.extend({}, amountTotalColumnStyle, {

        });

        const dataLabelSpanStyle = _.extend({}, labelSpanStyle, {
            "paddingLeft": "25px"
        });

        const dataAmountSpanStyle = _.extend({}, amountSpanStyle, {

        });

        const dataAmountTotalSpanStyle = _.extend({}, amountTotalSpanStyle, {

        });

        const sumAfterDataLabelColumnStyle = _.extend({}, labelColumnStyle, {
        });

        const sumAfterDataAmountColumnStyle = _.extend({}, amountColumnStyle, {
            "borderTop": "0px solid white",
            "borderBottom": "1px solid grey"
        });

        const sumAfterDataAmountTotalColumnStyle = _.extend({}, amountTotalColumnStyle, {

        });

        const sumAfterDataLabelSpanStyle = _.extend({}, labelSpanStyle, {
            "paddingLeft": "25px"
        });

        const sumAfterDataAmountSpanStyle = _.extend({}, amountSpanStyle, {

        });

        const sumAfterDataAmountTotalSpanStyle = _.extend({}, amountTotalSpanStyle, {

        });

        const sumDataLabelColumnStyle = _.extend({}, labelColumnStyle, {

        });

        const sumDataAmountColumnStyle = _.extend({}, amountColumnStyle, {

        });

        const sumDataAmountTotalColumnStyle = _.extend({}, amountTotalColumnStyle, {

        });

        const sumDataLabelSpanStyle = _.extend({}, labelSpanStyle, {
            "marginTop": "25px",
            "paddingLeft": "25px"
        });

        const sumDataAmountSpanStyle = _.extend({}, amountSpanStyle, {
            "marginTop": "25px",
        });

        const sumDataAmountTotalSpanStyle = _.extend({}, amountTotalSpanStyle, {
            "marginTop": "25px"
        });

        const totalSumDataLabelColumnStyle = _.extend({}, labelColumnStyle, {

        });

        const totalSumDataAmountColumnStyle = _.extend({}, amountColumnStyle, {

        });

        const totalSumDataAmountTotalColumnStyle = _.extend({}, amountTotalColumnStyle, {
            "borderTop": "0px solid white",
            "borderBottom": "1px solid grey"
        });

        const totalSumDataLabelSpanStyle = _.extend({}, labelSpanStyle, {
            "marginTop": "25px",
            "paddingLeft": "25px"
        });

        const totalSumDataAmountSpanStyle = _.extend({}, amountSpanStyle, {
            "marginTop": "25px",
        });

        const totalSumDataAmountTotalSpanStyle = _.extend({}, amountTotalSpanStyle, {
            "marginTop": "25px"
        });


        let chosenRowStyle = null;
        let chosenLabelColumnStyle = null;
        let chosenLabelSpanStyle = null;
        let chosenAmountColumnStyle = null;
        let chosenAmountSpanStyle = null;
        let chosenAmountTotalColumnStyle = null;
        let chosenAmountTotalSpanStyle = null;

        if (this.props.mode === 'title')
        {
            chosenRowStyle = titleRowStyle;
            chosenLabelColumnStyle = titleLabelColumnStyle;
            chosenLabelSpanStyle = titleLabelSpanStyle;
            chosenAmountColumnStyle = titleAmountColumnStyle;
            chosenAmountSpanStyle = titleAmountSpanStyle;
            chosenAmountTotalColumnStyle = titleAmountTotalColumnStyle;
            chosenAmountTotalSpanStyle = titleAmountTotalSpanStyle;
        }
        else if (this.props.mode === 'data')
        {
            chosenRowStyle = dataRowStyle;
            chosenLabelColumnStyle = dataLabelColumnStyle;
            chosenLabelSpanStyle = dataLabelSpanStyle;
            chosenAmountColumnStyle = dataAmountColumnStyle;
            chosenAmountSpanStyle = dataAmountSpanStyle;
            chosenAmountTotalColumnStyle = dataAmountTotalColumnStyle;
            chosenAmountTotalSpanStyle = dataAmountTotalSpanStyle;
        }
        else if (this.props.mode === 'sumAfter')
        {
            chosenRowStyle = sumAfterDataRowStyle;
            chosenLabelColumnStyle = sumAfterDataLabelColumnStyle;
            chosenLabelSpanStyle = sumAfterDataLabelSpanStyle;
            chosenAmountColumnStyle = sumAfterDataAmountColumnStyle;
            chosenAmountSpanStyle = sumAfterDataAmountSpanStyle;
            chosenAmountTotalColumnStyle = sumAfterDataAmountTotalColumnStyle;
            chosenAmountTotalSpanStyle = sumAfterDataAmountTotalSpanStyle;
        }
        else if (this.props.mode === 'sum')
        {
            chosenRowStyle = sumDataRowStyle;
            chosenLabelColumnStyle = sumDataLabelColumnStyle;
            chosenLabelSpanStyle = sumDataLabelSpanStyle;
            chosenAmountColumnStyle = sumDataAmountColumnStyle;
            chosenAmountSpanStyle = sumDataAmountSpanStyle;
            chosenAmountTotalColumnStyle = sumDataAmountTotalColumnStyle;
            chosenAmountTotalSpanStyle = sumDataAmountTotalSpanStyle;
        }
        else if (this.props.mode === 'sumTotal')
        {
            chosenRowStyle = totalSumDataRowStyle;
            chosenLabelColumnStyle = totalSumDataLabelColumnStyle;
            chosenLabelSpanStyle = totalSumDataLabelSpanStyle;
            chosenAmountColumnStyle = totalSumDataAmountColumnStyle;
            chosenAmountSpanStyle = totalSumDataAmountSpanStyle;
            chosenAmountTotalColumnStyle = totalSumDataAmountTotalColumnStyle;
            chosenAmountTotalSpanStyle = totalSumDataAmountTotalSpanStyle;
        }


        return <tr style={chosenRowStyle}>
            <td style={chosenLabelColumnStyle} width="40%"><span style={chosenLabelSpanStyle}>{this.props.row.label}</span></td>
            <td style={chosenAmountColumnStyle} width="30%"><span style={chosenAmountSpanStyle}>{this.props.row.amount}</span></td>
            <td style={chosenAmountTotalColumnStyle} width="30%"><span style={chosenAmountTotalSpanStyle}>{this.props.row.amountTotal}</span></td>
        </tr>
    }
}


class FinancialTable extends React.Component {
    render()
    {
        const tableStyle = {
            
        };

        return (
            <center>
                <table cellSpacing={0} align="center" style={tableStyle}>
                    <tbody>
                    {
                        this.props.rows.map((row, rowIndex) =>
                        {
                            return <Row key={rowIndex} row={row} mode={row.mode} fontSize={this.props.fontSize}/>
                        })
                    }
                    </tbody>
                </table>
            </center>
        )
    }
}

export default FinancialTable;

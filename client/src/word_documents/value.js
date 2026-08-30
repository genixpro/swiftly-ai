import React from 'react'
import { renderToString } from 'react-dom/server'
import readJSONInput from "./read_json_input";
import fs from "fs";
import Moment from 'react-moment';
import _ from "underscore";
import NumberFormat from 'react-number-format';

class Value extends React.Component {
    render()
    {
        let style = {
            "marginLeft": "3px",
            "marginRight": "3px"
        };

        if (this.props.style)
        {
           style = _.extend(style, this.props.style);
        }

        if (this.props.children === null)
        {
            return null;
        }

        return <span style={style}>{this.props.children}</span>;
    }
}

class CurrencyValue extends React.Component {
    render()
    {
        if (this.props.children === null || _.isUndefined(this.props.children))
        {
            return null;
        }

        const style = this.props.style || {};

        if (this.props.left)
        {
            style["textAlign"] = "left";
        }
        else if(this.props.center)
        {
            style["textAlign"] = "center";
        }
        else
        {
            style["textAlign"] = "right";
        }

        let decimalScale = 2;

        if (this.props.cents === false)
        {
            decimalScale = 0;
        }

        if (this.props.children < 0)
        {
            return <Value style={style}>($<NumberFormat value={-this.props.children} displayType={"text"} decimalScale={decimalScale} thousandSeparator={", "} />)</Value>;
        }
        else
        {

            return <Value style={style}>$<NumberFormat value={this.props.children} displayType={"text"} decimalScale={decimalScale} thousandSeparator={", "} /></Value>;
        }
    }
}

class PercentValue extends React.Component {
    render()
    {
        if (this.props.children === null || _.isUndefined(this.props.children))
        {
            return null;
        }

        const style = this.props.style || {};

        if (this.props.left)
        {
            style["textAlign"] = "left";
        }
        else if(this.props.center)
        {
            style["textAlign"] = "center";
        }
        else
        {
            style["textAlign"] = "right";
        }

        return <Value style={style}><NumberFormat value={this.props.children} displayType={"text"} decimalScale={2} fixedDecimalScale thousandSeparator={", "} />%</Value>;
    }
}


class IntegerValue extends React.Component {
    render()
    {
        if (this.props.children === null || _.isUndefined(this.props.children))
        {
            return null;
        }

        const style = this.props.style || {};

        if (this.props.left)
        {
            style["textAlign"] = "left";
        }
        else if(this.props.center)
        {
            style["textAlign"] = "center";
        }
        else
        {
            style["textAlign"] = "right";
        }

        return <Value style={style}><NumberFormat value={this.props.children} displayType={"text"} decimalScale={0} fixedDecimalScale thousandSeparator={", "} /></Value>;
    }
}


class AreaValue extends React.Component {
    render()
    {
        if (this.props.children === null || _.isUndefined(this.props.children))
        {
            return null;
        }

        const style = this.props.style || {};

        if (this.props.left)
        {
            style["textAlign"] = "left";
        }
        else if(this.props.center)
        {
            style["textAlign"] = "center";
        }
        else
        {
            style["textAlign"] = "right";
        }

        return <Value style={style}><NumberFormat value={this.props.children} displayType={"text"} decimalScale={0} fixedDecimalScale thousandSeparator={", "} /> sqft</Value>;
    }
}


export {Value, CurrencyValue, PercentValue, IntegerValue, AreaValue};

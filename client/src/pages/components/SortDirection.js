import React from 'react';


class SortDirection extends React.Component
{
    render()
    {
        if (!this.props.sort || !this.props.field)
        {
            return null;
        }

        if (this.props.sort.substr(1) === this.props.field)
        {
            if (this.props.sort.toString().indexOf("-") !== -1)
            {
                return <i className={"fa fa-arrow-down"} style={{"paddingLeft": "10px"}}></i>
            }
            else if (this.props.sort.toString().indexOf("+") !== -1)
            {
                return <i className={"fa fa-arrow-up"} style={{"paddingLeft": "10px"}}></i>
            }
            else
            {
                return null;
            }
        }
        else
        {
            return null;
        }
    }
}


export default SortDirection;
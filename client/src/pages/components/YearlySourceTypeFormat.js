import React from 'react';
import { FormGroup } from 'reactstrap';


class YearlySourceTypeFormat extends React.Component
{
    render()
    {
        if (this.props.value === 'actual')
        {
            return "Actuals";
        }
        else if (this.props.value === 'budget')
        {
            return "Budget";
        }
        else if (this.props.value === 'user')
        {
            return "User";
        }
        return "";
    }
}


export default YearlySourceTypeFormat;
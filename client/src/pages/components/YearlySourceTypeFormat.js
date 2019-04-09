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
        return "";
    }
}


export default YearlySourceTypeFormat;
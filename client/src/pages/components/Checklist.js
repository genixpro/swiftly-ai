import React from 'react';
import {Row, Col, Card, CardBody, CardHeader, Table, Button, CardTitle, Collapse} from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import ChecklistItem from "./ChecklistItem";

class Checklist extends React.Component {
    render() {
        return (
            (this.props.appraisal) ?
                <div id={"appraisal-checklist"} className={"appraisal-checklist"}>
                    <ChecklistItem title={"Building Information"}
                                   description={"Basic information on the building - such as its address."}
                                   completed={this.props.appraisal.validationResult.hasBuildingInformation}
                    />
                    <ChecklistItem title={"Rent Roll"}
                                   description={"The Rent-Rolls with information about your tenants"}
                                   completed={this.props.appraisal.validationResult.hasRentRoll}
                    />
                    <ChecklistItem title={"Income Statement"}
                                   description={"The Income Statement for your building, showing revenues and expenses."}
                                   completed={this.props.appraisal.validationResult.hasIncomeStatement}
                    />
                </div>
                : null
        );
    }
}

export default Checklist;

import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table, Button, NavItem, Nav, Navbar, NavLink } from 'reactstrap';
import { NavLink as RRNavLink } from 'react-router-dom';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import _ from 'underscore';
import Moment from 'react-moment';
import FieldDisplayEdit from './FieldDisplayEdit';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css'
import { Switch, Route } from 'react-router-dom';

class ComparableSaleSummaryList extends React.Component
{
    static defaultProps = {
    };

    state = {
        selectedUnit: null
    };


    render() {
        return (
            (this.props.appraisal) ?
                <Table hover={this.props.allowSelection} responsive className={"comparables-table " + (this.props.allowSelection ? "allow-selection" : "")}>
                    <thead>
                    <tr className={"header-row"}>
                        <td><strong>Date</strong></td>
                        <td><strong>Address</strong></td>
                        <td><strong>Building Size (sf)</strong></td>
                        <td><strong>Annual Net Rent (psf)</strong></td>
                        <td className={"action-column"} />
                    </tr>

                    </thead>
                    <tbody>



                    </tbody>
                </Table>
                : null
        );
    }
}

export default ComparableSaleSummaryList;

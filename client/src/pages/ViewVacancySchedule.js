import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table, Button, NavItem, Nav, Navbar, NavLink, Progress } from 'reactstrap';
import { NavLink as RRNavLink } from 'react-router-dom';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import _ from 'underscore';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css'
import { Switch, Route } from 'react-router-dom';
import moment from 'moment';

class ViewVacancySchedule extends React.Component
{
    state = {

    };


    getYears()
    {
        const start = moment();

        const years = [];

        for (let i = start.year(); i < start.year() + 10; i += 1)
        {
            years.push(i);
        }
        return years;
    }

    isUnitOccupiedInYear(unit, year)
    {
        for(let tenancy of unit.tenancies)
        {
            if (tenancy.startDate && tenancy.endDate)
            {
                const start = new Date(tenancy.startDate['$date']);
                const end = new Date(tenancy.endDate['$date']);

                if (year >= start.getFullYear() && year <= end.getFullYear())
                {
                    return true;
                }
            }
        }
        return false;
    }

    getSequentialOccupiedYears(unit)
    {
        const sequences = [];

        let currentOccupied = null;
        let currentVacant = null;
        let lastYear = null;
        this.getYears().forEach((year) =>
        {
            if (this.isUnitOccupiedInYear(unit, year))
            {
                if (currentVacant !== null)
                {
                    currentVacant.end = lastYear;
                    sequences.push(currentVacant);
                    currentVacant = null;
                }

                if (currentOccupied === null)
                {
                    currentOccupied = {
                        "start": year,
                        "occupied": true,
                        "period": 1
                    }
                }
                else
                {
                    currentOccupied.period += 1;
                }
            }
            else
            {
                if (currentOccupied !== null)
                {
                    currentOccupied.end = lastYear;
                    sequences.push(currentOccupied);
                    currentOccupied = null;
                }

                if (currentVacant === null)
                {
                    currentVacant = {
                        "start": year,
                        "occupied": false,
                        "period": 1
                    }
                }
                else
                {
                    currentVacant.period += 1;
                }
            }

            lastYear = year;
        });

        if (currentVacant !== null)
        {
            currentVacant.end = lastYear;
            sequences.push(currentVacant);
        }

        if (currentOccupied !== null)
        {
            currentOccupied.end = lastYear;
            sequences.push(currentOccupied);
        }

        return sequences;
    }


    render() {
        return (
            (this.props.appraisal) ?
                <div id={"view-vacancy-schedule"} className={"view-vacancy-schedule"}>
                    <Row>
                        <Col xs={12}>
                            <Table className={"vacancy-schedule-table"}>
                                <thead>
                                    <tr>
                                        <td>Unit</td>
                                        {
                                            this.getYears().map((year) =>
                                            {
                                                return <td>
                                                    {year}
                                                </td>
                                            })
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                {
                                    this.props.appraisal.units.map((unit) =>
                                    {
                                        return <tr>
                                            <td>{unit.unitNumber}</td>
                                            {
                                                this.getSequentialOccupiedYears(unit).map((occupation) =>
                                                {
                                                    return <td className={"occupancy-cell"} key={occupation.start} colSpan={occupation.period}>
                                                        {
                                                            occupation.occupied
                                                                ? <Progress value="100">Occupied {occupation.start} - {occupation.end}</Progress>
                                                                : <span>Vacant {occupation.start} - {occupation.end}</span>
                                                        }
                                                    </td>
                                                })
                                            }
                                        </tr>
                                    })
                                }
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </div>
                : null
        );
    }
}

export default ViewVacancySchedule;

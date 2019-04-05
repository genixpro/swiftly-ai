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

class UnitsTable extends React.Component
{
    static defaultProps = {
        allowSelection: true,
        statsMode: "all",
        allowNewUnit: true
    };

    state = {
        selectedUnit: null
    };

    onUnitClicked(unitNum)
    {
        if (this.props.onUnitClicked)
        {
            for (let unit of this.props.appraisal.units)
            {
                if (unit.unitNumber === unitNum)
                {
                    this.props.onUnitClicked(unit);
                }
            }
        }
    }

    renderUnitRow(unitInfo, unitIndex)
    {
        let selectedClass = "";
        if (this.props.selectedUnit && unitInfo.unitNumber === this.props.selectedUnit.unitNumber)
        {
            selectedClass = " selected-unit-row";
        }

        return <tr onClick={(evt) => this.onUnitClicked(unitInfo.unitNumber)} className={"unit-row " + selectedClass} key={unitIndex}>
            <td>{unitInfo.unitNumber}</td>
            <td>{unitInfo.currentTenancy.name}</td>
            <td className={"square-footage-column"}><NumberFormat
                value={unitInfo.squareFootage}
                displayType={'text'}
                thousandSeparator={', '}
                decimalScale={0}
                fixedDecimalScale={true}
            /></td>
            <td className={"rent-column"}>$<NumberFormat
                value={unitInfo.currentTenancy.yearlyRentPSF}
                displayType={'text'}
                thousandSeparator={', '}
                decimalScale={2}
                fixedDecimalScale={true}
            /></td>
            <td className={"action-column"}>
                <Button
                    color="info"
                    onClick={(evt) => this.removeUnit(unitInfo, unitIndex)}
                    title={"Delete Unit"}
                >
                    <i className="fa fa-trash-alt"></i>
                </Button>
            </td>
        </tr>;
    }

    removeUnit(unitInfo, unitIndex)
    {
        if (this.props.onRemoveUnit)
        {
            this.props.onRemoveUnit(unitIndex);
        }
    }


    createNewUnit(field, value)
    {
        if (this.props.onCreateUnit)
        {
            const newUnit = {
                tenancies: [],
                currentTenancy: {}
            };

            if (field)
            {
                newUnit[field] = value;
            }

            if (_.isUndefined(newUnit['unitNumber']))
            {
                newUnit['unitNumber'] = 'new';
            }

            if (_.isUndefined(newUnit['floorNumber']))
            {
                newUnit['floorNumber'] = 1;
            }

            if (_.isUndefined(newUnit['squareFootage']))
            {
                newUnit['squareFootage'] = 1;
            }

            this.props.onCreateUnit(newUnit);
        }
    }


    renderNewUnitRow()
    {
        return <tr className={"unit-row"}>
            <td>
                <FieldDisplayEdit
                    hideIcon={true}
                    value={""}
                    onChange={_.once((newValue) => this.createNewUnit("unitNumber", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    hideIcon={true}
                    value={""}
                    onChange={_.once((newValue) => this.createNewUnit("currentTenancy", {name: newValue}))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    hideIcon={true}
                    value={""}
                    onChange={_.once((newValue) => this.createNewUnit("squareFootage", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    hideIcon={true}
                    value={""}
                    onChange={_.once((newValue) => this.createNewUnit("currentTenancy", {yearlyRent: newValue}))}
                />
            </td>
            <td className={"action-column"}>
                <Button
                    color="info"
                    onClick={(evt) => this.createNewUnit()}
                    title={"New Unit"}
                >
                    <i className="fa fa-plus-square"></i>
                </Button>
            </td>
        </tr>;
    }


    getTotalSize()
    {
        let total = 0;
        for(let unit of this.props.appraisal.units)
        {
            total += unit.squareFootage;
        }
        return total;
    }

    getAverageSize()
    {
        let total = 0;
        let count = 0;
        for(let unit of this.props.appraisal.units)
        {
            if (unit.squareFootage !== 0)
            {
                total += unit.squareFootage;
                count += 1;
            }
        }
        return total / count;
    }

    getAverageRentPSF()
    {
        let total = 0;
        let count = 0;
        for(let unit of this.props.appraisal.units)
        {
            if (unit.currentTenancy.yearlyRent !== 0)
            {
                total += unit.currentTenancy.yearlyRent / unit.squareFootage;
                count += 1;
            }
        }
        return total / count;
    }

    getMinimumSize()
    {
        let minSize = null;
        for(let unit of this.props.appraisal.units)
        {
            if (unit.squareFootage !== 0)
            {
                if (minSize === null || unit.squareFootage < minSize)
                {
                    minSize = unit.squareFootage;
                }
            }
        }
        return minSize;
    }

    getMaximumSize()
    {
        let maxSize = null;
        for(let unit of this.props.appraisal.units)
        {
            if (unit.squareFootage !== 0)
            {
                if (maxSize === null || unit.squareFootage > maxSize)
                {
                    maxSize = unit.squareFootage;
                }
            }
        }
        return maxSize;
    }

    getMinimumRentPSF()
    {
        let minRentPSF = null;
        for(let unit of this.props.appraisal.units)
        {
            if (unit.currentTenancy.yearlyRent !== 0)
            {
                const rentPSF = unit.currentTenancy.yearlyRent / unit.squareFootage;
                if (minRentPSF === null || rentPSF < minRentPSF)
                {
                    minRentPSF = rentPSF;
                }
            }
        }
        return minRentPSF;
    }

    getMaximumRentPSF()
    {
        let maxRentPSF = null;
        for(let unit of this.props.appraisal.units)
        {
            if (unit.currentTenancy.yearlyRent !== 0)
            {
                const rentPSF = unit.currentTenancy.yearlyRent / unit.squareFootage;
                if (maxRentPSF === null || rentPSF > maxRentPSF)
                {
                    maxRentPSF = rentPSF;
                }
            }
        }
        return maxRentPSF;
    }


    render() {
        return (
            (this.props.appraisal) ?
                <Table hover={this.props.allowSelection} responsive className={"units-table " + (this.props.allowSelection ? "allow-selection" : "")}>
                    <thead>
                    <tr className={"header-row"}>
                        <td><strong>Unit Number</strong></td>
                        <td><strong>Tenant Name</strong></td>
                        <td className={"square-footage-column"}><strong>Size (sf)</strong></td>
                        <td className={"rent-column"}><strong>Annual Net Rent (psf)</strong></td>
                        <td className={"action-column"} />
                    </tr>

                    </thead>
                    <tbody>
                    {
                        this.props.appraisal && this.props.appraisal.units && Object.values(this.props.appraisal.units).map((unit, unitIndex) => {
                            return this.renderUnitRow(unit, unitIndex);
                        })
                    }
                    {
                        this.props.appraisal && this.props.allowNewUnit ?
                            this.renderNewUnitRow()
                            : null
                    }
                    {
                        this.props.statsMode === 'total' || this.props.statsMode === 'all' ?
                            <tr className={"first-total-row " + (this.props.statsMode === 'total' ? "last-total-row" : "")}>
                                <td></td>
                                <td><strong>Total</strong></td>
                                <td className={"square-footage-column"}>
                                    <NumberFormat
                                        value={this.getTotalSize()}
                                        displayType={'text'}
                                        thousandSeparator={', '}
                                        decimalScale={0}
                                        fixedDecimalScale={true}
                                    />
                                </td>
                                <td className={"rent-column"}></td>
                            </tr> : null
                    }
                    {
                        this.props.statsMode === 'all' ?
                            <tr className={"total-row"}>
                                <td></td>
                                <td><strong>Average</strong></td>
                                <td className={"square-footage-column"}>
                                    <NumberFormat
                                        value={this.getAverageSize()}
                                        displayType={'text'}
                                        thousandSeparator={', '}
                                        decimalScale={0}
                                        fixedDecimalScale={true}
                                    />
                                </td>
                                <td className={"rent-column"}>
                                    $<NumberFormat
                                    value={this.getAverageRentPSF()}
                                    displayType={'text'}
                                    thousandSeparator={', '}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                />
                                </td>
                            </tr> : null
                    }
                    {
                        this.props.statsMode === 'all' ?
                            <tr className={"last-total-row"}>
                                <td></td>
                                <td><strong>Range</strong></td>
                                <td className={"square-footage-column"}>
                                    <NumberFormat
                                        value={this.getMinimumSize()}
                                        displayType={'text'}
                                        thousandSeparator={', '}
                                        decimalScale={0}
                                        fixedDecimalScale={true}
                                    />&nbsp;-&nbsp;
                                    <NumberFormat
                                        value={this.getMaximumSize()}
                                        displayType={'text'}
                                        thousandSeparator={', '}
                                        decimalScale={0}
                                        fixedDecimalScale={true}
                                    />
                                </td>
                                <td className={"rent-column"}>
                                    $<NumberFormat
                                    value={this.getMinimumRentPSF()}
                                    displayType={'text'}
                                    thousandSeparator={', '}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                />&nbsp;-&nbsp;
                                    $<NumberFormat
                                    value={this.getMaximumRentPSF()}
                                    displayType={'text'}
                                    thousandSeparator={', '}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                />
                                </td>
                            </tr> : null
                    }
                    </tbody>
                </Table>
                : null
        );
    }
}

export default UnitsTable;

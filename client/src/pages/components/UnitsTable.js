import React from 'react';
import {Table, Button } from 'reactstrap';
import NumberFormat from 'react-number-format';
import _ from 'underscore';
import FieldDisplayEdit from './FieldDisplayEdit';
import 'react-datetime/css/react-datetime.css'
import UnitModel from "../../models/UnitModel";
import CurrencyFormat from "./CurrencyFormat";
import AreaFormat from "./AreaFormat";

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
            <td className={"square-footage-column"}><AreaFormat value={unitInfo.squareFootage}/></td>
            <td className={"rent-column"}>
                <CurrencyFormat value={unitInfo.currentTenancy.yearlyRentPSF || unitInfo.marketRent} />
            </td>
            {this.props.allowSelection ? <td className={"action-column"}>
                <Button
                    color="secondary"
                    onClick={(evt) => this.removeUnit(unitInfo, unitIndex)}
                    title={"Delete Unit"}
                >
                    <i className="fa fa-trash-alt"></i>
                </Button>
            </td> : null}
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
                tenancies: []
            };

            if (field)
            {
                newUnit[field] = value;
            }

            const newUnitObj = new UnitModel(newUnit);

            newUnitObj.unitNumber += " " + this.props.appraisal.units.length.toString();

            this.props.onCreateUnit(newUnitObj);
            this.props.onUnitClicked(newUnitObj);
        }
    }


    renderNewUnitRow()
    {
        return <tr className={"new-unit-row"}>
            <td colSpan={5}>
                <Button
                    className={"new-unit-button"}
                    color="secondary"
                    onClick={(evt) => this.createNewUnit()}
                    title={"New Unit"}
                >
                    Create a New Unit
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
                        {this.props.allowSelection ? <td className={"action-column"} /> : null}
                    </tr>

                    </thead>
                    <tbody>
                    {
                        this.props.appraisal && this.props.appraisal.units && Object.values(this.props.appraisal.units).map((unit, unitIndex) => {
                            return this.renderUnitRow(unit, unitIndex);
                        })
                    }
                    {
                        this.props.statsMode === 'total' || this.props.statsMode === 'all' ?
                            <tr className={"first-total-row " + (this.props.statsMode === 'total' ? "last-total-row" : "")}>
                                <td></td>
                                <td><strong>Total</strong></td>
                                <td className={"square-footage-column"}>
                                    <AreaFormat value={this.getTotalSize()}/>
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
                                    <AreaFormat value={this.getAverageSize()}/>
                                </td>
                                <td className={"rent-column"}>
                                    <CurrencyFormat value={this.getAverageRentPSF()} />
                                </td>
                            </tr> : null
                    }
                    {
                        this.props.statsMode === 'all' ?
                            <tr className={"last-total-row"}>
                                <td></td>
                                <td><strong>Range</strong></td>
                                <td className={"square-footage-column"}>
                                    <AreaFormat value={this.getMinimumSize()}/>&nbsp;-&nbsp;
                                    <AreaFormat value={this.getMaximumSize()}/>
                                </td>
                                <td className={"rent-column"}>
                                    <CurrencyFormat value={this.getMinimumRentPSF()}/>&nbsp;-&nbsp;
                                    <CurrencyFormat value={this.getMaximumRentPSF()}/>
                                </td>
                            </tr> : null
                    }
                    {
                        this.props.appraisal && this.props.allowNewUnit ?
                            this.renderNewUnitRow()
                            : null
                    }
                    </tbody>
                </Table>
                : null
        );
    }
}

export default UnitsTable;

import React from 'react';
import {Table, Button } from 'reactstrap';
import _ from 'underscore';
import 'react-datetime/css/react-datetime.css'
import UnitModel from "../../models/UnitModel";
import CurrencyFormat from "./CurrencyFormat";
import AreaFormat from "./AreaFormat";
import PropTypes from "prop-types";
import AppraisalModel from "../../models/AppraisalModel";
import IntegerFormat from "./IntegerFormat";

class UnitRow extends React.Component
{
    static instance = 0;

    state = {};

    static propTypes = {
        unit: PropTypes.instanceOf(UnitModel).isRequired,
        unitIndex: PropTypes.number.isRequired,
        onUnitClicked: PropTypes.func.isRequired,
        removeUnit: PropTypes.func.isRequired,
        allowSelection: PropTypes.bool.isRequired,
        fields: PropTypes.arrayOf(PropTypes.string),
        fieldConfiguration: PropTypes.object,
        selectedUnit: PropTypes.instanceOf(UnitModel)
    };

    render()
    {
        const unitInfo = this.props.unit;
        const unitIndex = this.props.unitIndex;

        let selectedClass = "";
        if (this.props.selectedUnit && unitInfo.unitNumber === this.props.selectedUnit.unitNumber)
        {
            selectedClass = " selected-unit-row";
        }

        return <tr onClick={(evt) => this.props.onUnitClicked(unitInfo.unitNumber)} className={"unit-row " + selectedClass}>
            {
                this.props.fields.map((field, fieldIndex) =>
                {
                    return <td key={fieldIndex} className={this.props.fieldConfiguration[field].className}>{this.props.fieldConfiguration[field].render(this.props.unit)}</td>;
                })
            }
            {this.props.allowSelection ? <td className={"action-column"}>
                <Button
                    color="secondary"
                    onClick={(evt) => this.props.removeUnit(unitInfo, unitIndex)}
                    title={"Delete Unit"}
                >
                    <i className="fa fa-trash-alt"></i>
                </Button>
            </td> : null}
        </tr>;
    }
}



class UnitsTable extends React.Component
{
    static defaultProps = {
        allowSelection: true,
        statsMode: "all",
        allowNewUnit: true
    };

    static propTypes = {
        appraisal: PropTypes.instanceOf(AppraisalModel).isRequired,
        allowNewUnit: PropTypes.bool.isRequired,
        statsMode: PropTypes.string,
        allowSelection: PropTypes.bool.isRequired,
        onCreateUnit: PropTypes.func,
        onUnitClicked: PropTypes.func,
        onRemoveUnit: PropTypes.func,
        fields: PropTypes.arrayOf(PropTypes.string),
        showStabilizedStats: PropTypes.bool
    };

    state = {
        selectedUnit: null
    };

    onUnitClicked(unitNum)
    {
        if (this.props.onUnitClicked)
        {
            let index = 0;
            for (let unit of this.props.appraisal.units)
            {
                if (unit.unitNumber === unitNum)
                {
                    this.props.onUnitClicked(unit, index);
                }
                index += 1;
            }
        }
    }

    removeUnit(unitInfo, unitIndex)
    {
        if (this.props.onRemoveUnit)
        {
            if (window.confirm("Are you sure you want to delete the unit?"))
            {
                this.props.onRemoveUnit(unitIndex);
            }
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

            const newUnitObj = UnitModel.create(newUnit, this.props.appraisal, "units");

            newUnitObj.unitNumber += " " + this.props.appraisal.units.length.toString();

            const newIndex = this.props.appraisal.units.length;

            this.props.onCreateUnit(newUnitObj);
            this.props.onUnitClicked(newUnitObj, newIndex);
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

    getAverageStabilizedRentPSF()
    {
        let total = 0;
        let count = 0;
        for(let unit of this.props.appraisal.units)
        {
            if (unit.stabilizedRentPSF !== 0)
            {
                total += unit.stabilizedRentPSF;
                count += 1;
            }
        }
        return total / count;
    }

    getTotalAnnualRent()
    {
        let total = 0;
        for (let unit of this.props.appraisal.units)
        {
            if (unit.currentTenancy.yearlyRent !== 0)
            {
                total += unit.currentTenancy.yearlyRent;
            }
        }
        return total;
    }

    getTotalStabilizedRent()
    {
        let total = 0;
        for (let unit of this.props.appraisal.units)
        {
            total += unit.stabilizedRent;
        }
        return total;
    }

    defaultFields()
    {
        if (!this.props.showStabilizedStats)
        {
            return [
                "unitNumber",
                "tenantName",
                "squareFootage",
                "stabilizedRentPSF",
                "stabilizedRent"
            ]
        }
        else
        {
            return [
                "unitNumber",
                "tenantName",
                "squareFootage",
                "stabilizedRentPSF",
                "stabilizedRent"
            ]
        }
    }


    render() {

        const fieldConfiguration = {
            "unitNumber": {
                "title": "Unit Number",
                "className": "unit-number-column",
                "render": (unit) => <span>{unit.unitNumber}</span>
            },
            "tenantName": {
                "title": "Tenant Name",
                "className": "tenant-name-column",
                "render": (unit) => <span>{unit.isVacantForStabilizedStatement ? "Vacant" : unit.currentTenancy.name}</span>
            },
            "squareFootage": {
                "title": "Size (sf)",
                "className": "square-footage-column",
                "render": (unit) => <IntegerFormat value={unit.squareFootage} />
            },
            "yearlyRentPSF": {
                "title": "Rent (psf)",
                "className": "rent-column",
                "render": (unit) => <CurrencyFormat value={unit.currentTenancy.yearlyRentPSF}/>
            },
            "yearlyRent": {
                "title": "Annual Rent",
                "className": "rent-column",
                "render": (unit) => <CurrencyFormat value={unit.currentTenancy.yearlyRent} />
            },
            "stabilizedRentPSF": {
                "title": "Rent (psf)",
                "className": "rent-column",
                "render": (unit) => <CurrencyFormat value={unit.shouldUseMarketRent && unit.marketRent ? unit.marketRentAmount : unit.currentTenancy.yearlyRentPSF}/>
            },
            "stabilizedRent": {
                "title": "Annual Rent",
                "className": "rent-column",
                "render": (unit) => <CurrencyFormat value={unit.shouldUseMarketRent && unit.marketRent ? unit.marketRentAmount * unit.squareFootage : unit.currentTenancy.yearlyRent} />
            }
        };

        const fields = this.props.fields || this.defaultFields();

        fields.forEach((field) =>
        {
            if (!fieldConfiguration[field])
            {
                const message = `Error! No field configuration for ${field}`;
                console.error(message);

                if (process.env.VALUATE_ENVIRONMENT.REACT_APP_DEBUG)
                {
                    alert(message);
                }
            }
        });

        return (
            (this.props.appraisal) ?
                <Table hover={!!this.props.onUnitClicked} responsive className={"units-table " + (this.props.onUnitClicked ? "allow-selection" : "")}>
                    <thead>
                    <tr className={"header-row"}>
                        {
                            fields.map((field, fieldIndex) =>
                            {
                                return <td key={fieldIndex} className={fieldConfiguration[field].className}><strong>{fieldConfiguration[field].title}</strong></td>;
                            })
                        }
                        {this.props.onUnitClicked ? <td className={"action-column"} /> : null}
                    </tr>

                    </thead>
                    <tbody>
                    {
                        this.props.appraisal && this.props.appraisal.units && Object.values(this.props.appraisal.units).map((unit, unitIndex) => {
                            return <UnitRow
                                key={unitIndex}
                                unit={unit}
                                unitIndex={unitIndex}
                                selectedUnit={this.props.selectedUnit}
                                fields={fields}
                                fieldConfiguration={fieldConfiguration}
                                onUnitClicked={this.onUnitClicked.bind(this)}
                                removeUnit={this.removeUnit.bind(this)}
                                allowSelection={this.props.allowSelection}
                            />;
                        })
                    }
                    {
                        this.props.statsMode === 'total' || this.props.statsMode === 'all' ?
                            <tr className={"first-total-row " + (this.props.statsMode === 'total' ? "last-total-row" : "")}>
                                <td className={"unit-number-column"}></td>
                                <td className={"tenant-name-column"}><strong>Total</strong></td>
                                <td className={"square-footage-column"}>
                                    <AreaFormat value={this.getTotalSize()}/>
                                </td>
                                <td className={"rent-column"}>
                                    {
                                        // this.props.showStabilizedStats
                                        //     ? <CurrencyFormat value={this.getAverageStabilizedRentPSF()} cents={true} />
                                            <CurrencyFormat value={this.getAverageRentPSF()} cents={true} />
                                    }
                                </td>
                                <td className={"rent-column"}>
                                    {
                                        // this.props.showStabilizedStats
                                            <CurrencyFormat value={this.getTotalStabilizedRent()} cents={false} />
                                            // : <CurrencyFormat value={this.getTotalAnnualRent()} cents={false} />
                                    }
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

import React from 'react';
import FieldDisplayEdit from "./FieldDisplayEdit";
import {Table, Button} from "reactstrap";
import {ComparableAdjustmentChartModel, ComparableAdjustmentModel} from "../../models/ComparableAdjustmentChartModel";
import CurrencyFormat from "./CurrencyFormat";


class ComparableAdjustmentChart extends React.Component
{
    newAdjustment(data)
    {
        const adjustment = ComparableAdjustmentModel.create(data, this.props.appraisal.adjustmentChart, "adjustments");

        if (!adjustment.name)
        {
            adjustment.name = "New Adjustment";
        }

        if (!adjustment.adjustmentAmounts)
        {
            adjustment.adjustmentAmounts = {};
        }

        this.props.appraisal.adjustmentChart.adjustments.push(adjustment);

        if (this.props.onChange)
        {
            this.props.onChange(this.props.appraisal.adjustmentChart);
        }
    }


    changeAdjustment(adjustment, field, value)
    {
        adjustment[field] = value;

        if (this.props.onChange)
        {
            this.props.onChange(this.props.appraisal.adjustmentChart);
        }
    }


    changeAdjustmentCompAmount(adjustment, field, compId, value)
    {
        if (value !== null)
        {
            adjustment[field][compId] = value;
        }
        else
        {
            if (adjustment[field][compId])
            {
                adjustment[field][compId] = undefined;
            }
        }

        if (this.props.onChange)
        {
            this.props.onChange(this.props.appraisal.adjustmentChart);
        }
    }


    deleteAdjustment(adjustmentIndex)
    {
        this.props.appraisal.adjustmentChart.adjustments.splice(adjustmentIndex, 1);

        if (this.props.onChange)
        {
            this.props.onChange(this.props.appraisal.adjustmentChart);
        }
    }


    computeAdjustedAmount(comparable)
    {
        let salePrice = comparable.salePrice;
        for (let adjustment of this.props.appraisal.adjustmentChart.adjustments)
        {
            if (adjustment.adjustmentType === 'amount')
            {
                if (adjustment.adjustmentAmounts[comparable._id])
                {
                    salePrice += adjustment.adjustmentAmounts[comparable._id];
                }
            }

            if (adjustment.adjustmentType === 'percentage')
            {
                if (adjustment.adjustmentPercentages[comparable._id])
                {
                    salePrice += comparable.salePrice * adjustment.adjustmentPercentages[comparable._id] / 100;
                }
            }
        }

        return salePrice;
    }


    render()
    {
        return (
            <div className={"comparable-adjustment-chart"}>
                <table className={"adjustment-chart-table"}>
                    <tbody>
                    <tr>
                        <td className={"name-column"}>
                            &nbsp;
                        </td>
                        {
                            this.props.comparableSales.map((comp, compIndex) =>
                            {
                                return <td key={compIndex}>#{compIndex + 1}</td>
                            })
                        }
                        <td />
                    </tr>
                    <tr>
                        <td className={"name-column"}>
                            Sale Price
                        </td>
                        {
                            this.props.comparableSales.map((comp, compIndex) =>
                            {
                                return <td key={compIndex}>
                                    <CurrencyFormat value={comp.salePrice} cents={false} />
                                </td>
                            })
                        }
                        <td />
                    </tr>
                    {
                        (this.props.appraisal.adjustmentChart.adjustments ? this.props.appraisal.adjustmentChart.adjustments : []).map((adjustment, adjustmentIndex) =>
                        {
                            return <tr key={adjustmentIndex}>
                                <td className={"name-column"}>
                                    <FieldDisplayEdit
                                        value={adjustment.name}
                                        type={"text"}
                                        placeholder={"New Adjustment..."}
                                        onChange={(newValue) => this.changeAdjustment(adjustment, "name", newValue)}
                                    />
                                    <FieldDisplayEdit
                                        value={adjustment.adjustmentType}
                                        type={"adjustmentType"}
                                        placeholder={"Adjustment Type"}
                                        onChange={(newValue) => this.changeAdjustment(adjustment, "adjustmentType", newValue)}
                                    />
                                </td>
                                {
                                    this.props.comparableSales.map((comp, compIndex) =>
                                    {
                                        return <td key={compIndex} className={"adjustment-column"}>
                                            {
                                                adjustment.adjustmentType === 'amount' ?
                                                    <FieldDisplayEdit
                                                        value={adjustment.adjustmentAmounts[comp._id]}
                                                        type={"currency"}
                                                        cents={false}
                                                        placeholder={"+/- ($)"}
                                                        onChange={(newValue) => this.changeAdjustmentCompAmount(adjustment, "adjustmentAmounts", comp._id, newValue)}
                                                    /> : null
                                            }
                                            {
                                                adjustment.adjustmentType === 'percentage' ?
                                                    <FieldDisplayEdit
                                                        value={adjustment.adjustmentPercentages[comp._id]}
                                                        type={"percent"}
                                                        cents={false}
                                                        placeholder={"+/- (%)"}
                                                        onChange={(newValue) => this.changeAdjustmentCompAmount(adjustment, "adjustmentPercentages", comp._id, newValue)}
                                                    /> : null
                                            }
                                            {
                                                adjustment.adjustmentType === 'text' ?
                                                    <FieldDisplayEdit
                                                        value={adjustment.adjustmentTexts[comp._id]}
                                                        type={"text"}
                                                        cents={false}
                                                        placeholder={""}
                                                        onChange={(newValue) => this.changeAdjustmentCompAmount(adjustment, "adjustmentTexts", comp._id, newValue)}
                                                    /> : null
                                            }
                                        </td>
                                    })
                                }
                                <td>
                                    <Button color={'danger'} onClick={() => this.deleteAdjustment(adjustmentIndex)}>
                                        <i className={"fa fa-trash-alt"}  />
                                    </Button>
                                </td>
                            </tr>
                        }).concat(
                            <tr key={(this.props.appraisal.adjustmentChart.adjustments ? this.props.appraisal.adjustmentChart.adjustments : []).length}>
                                <td className={"name-column"}>
                                    <FieldDisplayEdit
                                        value={""}
                                        type={"text"}
                                        placeholder={"New Adjustment..."}
                                        onChange={(newValue) => this.newAdjustment({name: newValue})}
                                    />
                                    <FieldDisplayEdit
                                        value={null}
                                        type={"adjustmentType"}
                                        placeholder={"Adjustment Type"}
                                        onChange={(newValue) => this.newAdjustment({"adjustmentType": newValue})}
                                    />
                                </td>
                                {
                                    this.props.comparableSales.map((comp, compIndex) =>
                                    {
                                        return <td key={compIndex}>
                                            <FieldDisplayEdit
                                                value={null}
                                                type={"currency"}
                                                cents={false}
                                                placeholder={"+/- (%)"}
                                                onChange={(newValue) => this.newAdjustment({"adjustmentPercentages": {[comp._id]: newValue}})}
                                            />
                                        </td>
                                    })
                                }
                                <td>
                                    <Button color={'primary'}
                                            onClick={() => this.newAdjustment({})}
                                    >
                                        <i className={"fa fa-plus-square"}  />
                                    </Button>
                                </td>
                            </tr>
                        )
                    }
                    <tr className={"adjusted-amount-row"}>
                        <td className={"name-column"}>
                            Adjusted Amount
                        </td>
                        {
                            this.props.comparableSales.map((comp, compIndex) =>
                            {
                                return <td key={compIndex} className={"adjustment-column"}>
                                    <CurrencyFormat value={this.computeAdjustedAmount(comp)} cents={false} />
                                </td>
                            })
                        }
                        <td>

                        </td>
                    </tr>
                    <tr>
                        <td className={"name-column"}>
                            Adjusted Amount (psf)
                        </td>
                        {
                            this.props.comparableSales.map((comp, compIndex) =>
                            {
                                return <td key={compIndex} className={"adjustment-column"}>
                                    <CurrencyFormat value={this.computeAdjustedAmount(comp) / comp.sizeSquareFootage} cents={true} />
                                </td>
                            })
                        }
                        <td>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}


export default ComparableAdjustmentChart;
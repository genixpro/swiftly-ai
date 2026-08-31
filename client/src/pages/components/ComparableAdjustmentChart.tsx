import FieldDisplayEdit from "./FieldDisplayEdit";
import {Button} from "reactstrap";
import CurrencyFormat from "./CurrencyFormat";
import {adjustedComparableSaleAmount, createComparableAdjustment, type ComparableAdjustment} from '../../domain/comparableAdjustmentChart';

interface ComparableAdjustmentChartAppraisal {
    adjustmentChart: {
        adjustments?: ComparableAdjustment[];
    };
}

interface ComparableAdjustmentChartSale {
    _id: string;
    salePrice: number;
    sizeSquareFootage: number;
}

type AdjustmentValueField = 'adjustmentAmounts' | 'adjustmentPercentages' | 'adjustmentTexts';

interface ComparableAdjustmentChartProps {
    appraisal: ComparableAdjustmentChartAppraisal;
    comparableSales: readonly ComparableAdjustmentChartSale[];
    onChange?(adjustmentChart: ComparableAdjustmentChartAppraisal['adjustmentChart']): void;
}

function ComparableAdjustmentChart(props: ComparableAdjustmentChartProps) {
    const notifyChange = () => {
        props.onChange?.(props.appraisal.adjustmentChart);
    };
    const newAdjustment = (data: ComparableAdjustment) => {
        const adjustment = createComparableAdjustment(data);

        if (!adjustment.name)
        {
            adjustment.name = "New Adjustment";
        }

        if (!adjustment.adjustmentAmounts)
        {
            adjustment.adjustmentAmounts = {};
        }

        props.appraisal.adjustmentChart.adjustments!.push(adjustment);
        notifyChange();
    };
    const changeAdjustment = (adjustment: ComparableAdjustment, field: string, value: unknown) => {
        adjustment[field] = value;
        notifyChange();
    };
    const changeAdjustmentCompAmount = (adjustment: ComparableAdjustment, field: AdjustmentValueField, compId: string, value: unknown) => {
        const amounts = adjustment[field]!;
        if (value !== null)
        {
            amounts[compId] = value as never;
        }
        else
        {
            if (amounts[compId])
            {
                amounts[compId] = undefined;
            }
        }

        notifyChange();
    };
    const deleteAdjustment = (adjustmentIndex: number) => {
        props.appraisal.adjustmentChart.adjustments!.splice(adjustmentIndex, 1);
        notifyChange();
    };
    const computeAdjustedAmount = (comparable: ComparableAdjustmentChartSale) =>
        adjustedComparableSaleAmount(comparable, props.appraisal.adjustmentChart.adjustments);

    return (
            <div className={"comparable-adjustment-chart"}>
                <table className={"adjustment-chart-table"}>
                    <tbody>
                    <tr>
                        <td className={"name-column"}>
                            &nbsp;
                        </td>
                        {
                            props.comparableSales.map((_comp, compIndex) =>
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
                            props.comparableSales.map((comp, compIndex) =>
                            {
                                return <td key={compIndex}>
                                    <CurrencyFormat value={comp.salePrice} cents={false} />
                                </td>
                            })
                        }
                        <td />
                    </tr>
                    {
                        (props.appraisal.adjustmentChart.adjustments ? props.appraisal.adjustmentChart.adjustments : []).map((adjustment, adjustmentIndex) =>
                        {
                            return <tr key={adjustmentIndex}>
                                <td className={"name-column"}>
                                    <FieldDisplayEdit
                                        value={adjustment.name}
                                        type={"text"}
                                        placeholder={"New Adjustment..."}
                                        onChange={(newValue) => changeAdjustment(adjustment, "name", newValue)}
                                    />
                                    <FieldDisplayEdit
                                        value={adjustment.adjustmentType}
                                        type={"adjustmentType"}
                                        placeholder={"Adjustment Type"}
                                        onChange={(newValue) => changeAdjustment(adjustment, "adjustmentType", newValue)}
                                    />
                                </td>
                                {
                                    props.comparableSales.map((comp, compIndex) =>
                                    {
                                        return <td key={compIndex} className={"adjustment-column"}>
                                            {
                                                adjustment.adjustmentType === 'amount' ?
                                                    <FieldDisplayEdit
                                                        value={adjustment.adjustmentAmounts![comp._id]}
                                                        type={"currency"}
                                                        cents={false}
                                                        placeholder={"+/- ($)"}
                                                        onChange={(newValue) => changeAdjustmentCompAmount(adjustment, "adjustmentAmounts", comp._id, newValue)}
                                                    /> : null
                                            }
                                            {
                                                adjustment.adjustmentType === 'percentage' ?
                                                    <FieldDisplayEdit
                                                        value={adjustment.adjustmentPercentages![comp._id]}
                                                        type={"percent"}
                                                        cents={false}
                                                        placeholder={"+/- (%)"}
                                                        onChange={(newValue) => changeAdjustmentCompAmount(adjustment, "adjustmentPercentages", comp._id, newValue)}
                                                    /> : null
                                            }
                                            {
                                                adjustment.adjustmentType === 'text' ?
                                                    <FieldDisplayEdit
                                                        value={adjustment.adjustmentTexts![comp._id]}
                                                        type={"text"}
                                                        cents={false}
                                                        placeholder={""}
                                                        onChange={(newValue) => changeAdjustmentCompAmount(adjustment, "adjustmentTexts", comp._id, newValue)}
                                                    /> : null
                                            }
                                        </td>
                                    })
                                }
                                <td>
                                    <Button color={'danger'} onClick={() => deleteAdjustment(adjustmentIndex)}>
                                        <i className={"fa fa-trash-alt"}  />
                                    </Button>
                                </td>
                            </tr>
                        }).concat(
                            <tr key={(props.appraisal.adjustmentChart.adjustments ? props.appraisal.adjustmentChart.adjustments : []).length}>
                                <td className={"name-column"}>
                                    <FieldDisplayEdit
                                        value={""}
                                        type={"text"}
                                        placeholder={"New Adjustment..."}
                                        onChange={(newValue) => newAdjustment({name: newValue as string | null})}
                                    />
                                    <FieldDisplayEdit
                                        value={null}
                                        type={"adjustmentType"}
                                        placeholder={"Adjustment Type"}
                                        onChange={(newValue) => newAdjustment({"adjustmentType": newValue as string | null})}
                                    />
                                </td>
                                {
                                    props.comparableSales.map((comp, compIndex) =>
                                    {
                                        return <td key={compIndex}>
                                            <FieldDisplayEdit
                                                value={null}
                                                type={"currency"}
                                                cents={false}
                                                placeholder={"+/- (%)"}
                                                onChange={(newValue) => newAdjustment({"adjustmentPercentages": {[comp._id]: newValue as number | null | undefined}})}
                                            />
                                        </td>
                                    })
                                }
                                <td>
                                    <Button color={'primary'}
                                            onClick={() => newAdjustment({})}
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
                            props.comparableSales.map((comp, compIndex) =>
                            {
                                return <td key={compIndex} className={"adjustment-column"}>
                                    <CurrencyFormat value={computeAdjustedAmount(comp)} cents={false} />
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
                            props.comparableSales.map((comp, compIndex) =>
                            {
                                return <td key={compIndex} className={"adjustment-column"}>
                                    <CurrencyFormat value={computeAdjustedAmount(comp) / comp.sizeSquareFootage} cents={true} />
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


export default ComparableAdjustmentChart;

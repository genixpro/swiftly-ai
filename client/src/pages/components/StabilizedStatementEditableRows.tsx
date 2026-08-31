import FieldDisplayEdit from './FieldDisplayEdit';
import type {IncomeStatementItemDTO} from '../../api/types';

interface StabilizedEditableStatement {
    items?: IncomeStatementItemDTO[] | null;
}

interface StabilizedStatementEditableRowsProps {
    appraisalType?: string;
    hideIconOnNewAmount?: boolean;
    incomeField: 'incomes' | 'expenses';
    appraisalYear: number;
    label: string;
    showEmptyRowWhenHidden?: boolean;
    statement: StabilizedEditableStatement;
    onChange(index: number, field: string, value: unknown, incomeField: 'incomes' | 'expenses'): void;
    onCreate(field: string, value: unknown, incomeField: 'incomes' | 'expenses'): void;
}

/**
 * Keeps the stabilized-statement's editable income/expense rows in their
 * established order, including the income row shown for detailed appraisals.
 */
function StabilizedStatementEditableRows({
    appraisalType,
    hideIconOnNewAmount = false,
    incomeField,
    appraisalYear,
    label,
    showEmptyRowWhenHidden = false,
    statement,
    onChange,
    onCreate,
}: StabilizedStatementEditableRowsProps) {
    const visible = appraisalType === 'simple';
    if (!visible && !showEmptyRowWhenHidden) return null;

    const items = visible ? statement.items ?? [] : [];
    const rows = items.map((item, index) => <tr className={"data-row income-row"} key={index}>
        <td className={"label-column"}>
            <span><FieldDisplayEdit
                type={"text"}
                placeholder={`Add/Remove ${label}`}
                value={item.name}
                hideIcon={true}
                onChange={(newValue) => onChange(index, "name", newValue, incomeField)}
            /></span>
        </td>
        <td className={"amount-column"}>
            <FieldDisplayEdit
                hideIcon={true}
                type={"currency"}
                placeholder={"Amount"}
                value={item.yearlyAmounts?.[appraisalYear]}
                onChange={(newValue) => onChange(index, "yearlyAmounts", newValue, incomeField)}
            />
        </td>
        <td className={"amount-total-column"}>
        </td>
    </tr>);

    rows.push(<tr className={"data-row income-row"} key={(statement.items || []).length}>
        <td className={"label-column"}>
            <span><FieldDisplayEdit
                type={"text"}
                placeholder={`Add/Remove ${label}`}
                hideIcon={true}
                onChange={(newValue) => onCreate("name", newValue, incomeField)}
            /></span>
        </td>
        <td className={"amount-column"}>
            <FieldDisplayEdit
                type={"currency"}
                placeholder={"Amount"}
                hideIcon={hideIconOnNewAmount}
                onChange={(newValue) => onCreate("yearlyAmounts", newValue, incomeField)}
            />
        </td>
        <td className={"amount-total-column"}>
        </td>
    </tr>);

    return <>{rows}</>;
}

export default StabilizedStatementEditableRows;

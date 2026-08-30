import type {NavigateFunction} from 'react-router';

export interface FinancialStatementListRecord {
    _id: string;
    fileName?: string;
}

interface FinancialStatementListItemProps {
    financialStatement: FinancialStatementListRecord;
    navigate: NavigateFunction;
    search?: string;
    appraisalId: string;
}

export default function FinancialStatementListItem({financialStatement, navigate, appraisalId}: FinancialStatementListItemProps) {
    return <tr onClick={() => navigate(`/appraisal/${appraisalId}/financial_statement/${financialStatement._id}/audit`)} className="financial-statement-list-item">
        <td>{financialStatement.fileName}</td>
    </tr>;
}

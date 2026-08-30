import type {NavigateFunction} from 'react-router';
import {Table} from 'reactstrap';
import FinancialStatementListItem, {type FinancialStatementListRecord} from './FinancialStatementListItem';

interface FinancialStatementListProps {
    financialStatements: FinancialStatementListRecord[];
    navigate: NavigateFunction;
    search?: string;
    appraisalId: string;
}

export default function FinancialStatementList({financialStatements, navigate, search, appraisalId}: FinancialStatementListProps) {
    return <Table striped bordered hover responsive>
        <thead><tr><th>Name</th></tr></thead>
        <tbody>{financialStatements.map(financialStatement => <FinancialStatementListItem key={financialStatement._id} financialStatement={financialStatement} navigate={navigate} search={search} appraisalId={appraisalId} />)}</tbody>
    </Table>;
}

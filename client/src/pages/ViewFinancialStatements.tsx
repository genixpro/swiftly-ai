import type {NavigateFunction} from 'react-router';
import {Card, CardBody, Col, Row} from 'reactstrap';
import {useFiles} from '../api/hooks';
import FinancialStatementList from './components/FinancialStatementList';

export default function ViewFinancialStatements({appraisalId, navigate, search}: {
    appraisalId: string;
    navigate: NavigateFunction;
    search?: string;
}) {
    const statements = useFiles(appraisalId, 'financials');
    return <Row><Col xs={12}><Card className="card-default"><CardBody><div><Row>
        <Col xs={12}><h3>View Financial Statements</h3></Col>
        <Col xs={12}><FinancialStatementList financialStatements={statements.data ?? []} navigate={navigate} search={search} appraisalId={appraisalId} /></Col>
    </Row></div></CardBody></Card></Col></Row>;
}

import {Navigate, NavLink, Route, Routes} from 'react-router';
import {Card, CardBody, Col, Nav, NavItem, Row} from 'reactstrap';
import {useFile, useUpdateFile} from '../api/hooks';
import type {FileDTO} from '../api/types';
import ViewFinancialStatementAudit from './ViewFinancialStatementAudit';

export default function ViewFinancialStatement({appraisalId, financialStatementId}: {appraisalId: string; financialStatementId: string}) {
    const statement = useFile(appraisalId, financialStatementId);
    const updateStatement = useUpdateFile(appraisalId, financialStatementId);
    const saveFinancialStatementData = async (nextStatement: FileDTO) => {
        await updateStatement.mutateAsync({extractedData: nextStatement.extractedData});
    };
    return <Row><Col xs={12}><Card className="card-default"><CardBody><div id="view-lease-page">
        <Row><Col xs={12}><Nav tabs><NavItem>
            <NavLink to={`/appraisal/${appraisalId}/financial_statement/${financialStatementId}/audit`} className={({isActive}) => `nav-link${isActive ? ' active' : ''}`}>Extracted Data</NavLink>
        </NavItem></Nav></Col></Row>
        {statement.data ? <Row><Col xs={12}><Card className="card-default"><CardBody><Routes>
            <Route index element={<Navigate to="audit" replace />} />
            {['audit', 'summary', 'report'].map(path => <Route key={path} path={path} element={<ViewFinancialStatementAudit financialStatement={statement.data} saveFinancialStatementData={saveFinancialStatementData} />} />)}
        </Routes></CardBody></Card></Col></Row> : null}
    </div></CardBody></Card></Col></Row>;
}

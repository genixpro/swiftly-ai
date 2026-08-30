import {Navigate, NavLink, Route, Routes} from 'react-router';
import {Card, CardBody, Col, Nav, NavItem, Row} from 'reactstrap';
import {useFile, useUpdateFile} from '../api/hooks';
import type {FileDTO} from '../api/types';
import ViewLeaseReport from './ViewLeaseReport';

export default function ViewLease({appraisalId, leaseId}: {appraisalId: string; leaseId: string}) {
    const lease = useFile(appraisalId, leaseId);
    const updateLease = useUpdateFile(appraisalId, leaseId);
    const saveLeaseData = async (nextLease: FileDTO) => {
        await updateLease.mutateAsync({extractedData: nextLease.extractedData});
    };
    return <Row><Col xs={12}><Card className="card-default"><CardBody><div id="view-lease-page">
        <Row><Col xs={12}><Nav tabs><NavItem>
            <NavLink to={`/appraisal/${appraisalId}/lease/${leaseId}/report`} className={({isActive}) => `nav-link${isActive ? ' active' : ''}`}>Report</NavLink>
        </NavItem></Nav></Col></Row>
        {lease.data ? <Row><Col xs={12}><Card className="card-default"><CardBody><Routes>
            <Route index element={<Navigate to="report" replace />} />
            {['summary', 'report'].map(path => <Route key={path} path={path} element={<ViewLeaseReport lease={lease.data} saveLeaseData={saveLeaseData} />} />)}
        </Routes></CardBody></Card></Col></Row> : null}
    </div></CardBody></Card></Col></Row>;
}

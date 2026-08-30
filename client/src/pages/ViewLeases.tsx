import type {NavigateFunction} from 'react-router';
import {Card, CardBody, Col, Row} from 'reactstrap';
import {useFiles} from '../api/hooks';
import LeaseList from './components/LeaseList';

export default function ViewLeases({appraisalId, navigate, search}: {
    appraisalId: string;
    navigate: NavigateFunction;
    search?: string;
}) {
    const leases = useFiles(appraisalId, 'lease');
    return <Row><Col xs={12}><Card className="card-default"><CardBody><div><Row>
        <Col xs={12}><h3>View Leases</h3></Col>
        <Col xs={12}><LeaseList leases={leases.data ?? []} navigate={navigate} search={search} appraisalId={appraisalId} /></Col>
    </Row></div></CardBody></Card></Col></Row>;
}

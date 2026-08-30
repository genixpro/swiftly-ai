import type {NavigateFunction} from 'react-router';
import {Table} from 'reactstrap';
import LeaseListItem, {type LeaseListRecord} from './LeaseListItem';

interface LeaseListProps {
    leases: LeaseListRecord[];
    navigate: NavigateFunction;
    search?: string;
    appraisalId: string;
}

export default function LeaseList({leases, navigate, search, appraisalId}: LeaseListProps) {
    return <Table striped bordered hover responsive>
        <thead><tr><th>Name</th><th>Monthly Rent</th><th>Size</th><th>Term</th></tr></thead>
        <tbody>{leases.map(lease => <LeaseListItem key={lease._id} lease={lease} navigate={navigate} search={search} appraisalId={appraisalId} />)}</tbody>
    </Table>;
}

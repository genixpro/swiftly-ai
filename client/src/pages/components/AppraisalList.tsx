import type {NavigateFunction} from 'react-router';
import {Table} from 'reactstrap';
import type {AppraisalDTO} from '@api/types';
import AppraisalListItem from './AppraisalListItem';

interface AppraisalListProps {
    appraisals: AppraisalDTO[];
    deleteAppraisal: (appraisal: AppraisalDTO) => void;
    navigate: NavigateFunction;
    search?: string;
}

export default function AppraisalList({appraisals, deleteAppraisal, navigate, search}: AppraisalListProps) {
    return <Table striped bordered hover responsive>
        <thead><tr><th>Name</th><th>Address</th><th>Actions</th></tr></thead>
        <tbody>{appraisals.map(appraisal => <AppraisalListItem key={appraisal._id} deleteAppraisal={deleteAppraisal} appraisal={appraisal} navigate={navigate} search={search} />)}</tbody>
    </Table>;
}

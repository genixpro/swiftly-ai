import type {NavigateFunction} from 'react-router';

export interface LeaseListRecord {
    _id: string;
    fileName?: string;
    extractedData?: {
        rent_per_square_foot?: string | number;
        size_square_feet?: string | number;
        term?: string | number;
    };
}

interface LeaseListItemProps {
    lease: LeaseListRecord;
    navigate: NavigateFunction;
    search?: string;
    appraisalId: string;
}

export default function LeaseListItem({lease, navigate, appraisalId}: LeaseListItemProps) {
    return <tr onClick={() => navigate(`/appraisal/${appraisalId}/lease/${lease._id}/summary`)} className="lease-list-item">
        <td>{lease.fileName}</td>
        <td>{lease.extractedData?.rent_per_square_foot ?? ''}</td>
        <td>{lease.extractedData?.size_square_feet ?? ''}</td>
        <td>{lease.extractedData?.term ?? ''}</td>
    </tr>;
}

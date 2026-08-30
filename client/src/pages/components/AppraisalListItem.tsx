import type {MouseEvent} from 'react';
import {Button} from 'reactstrap';
import {useAppraisalNavigation} from '../../app/AppraisalNavigation';
import type {AppraisalDTO} from '../../api/types';

interface AppraisalListItemProps {
    appraisal: AppraisalDTO;
    deleteAppraisal(appraisal: AppraisalDTO): void;
    navigate(path: string): void;
    search?: string;
}

export default function AppraisalListItem({appraisal, deleteAppraisal, navigate}: AppraisalListItemProps) {
    const navigation = useAppraisalNavigation();

    const itemClicked = () => {
        navigation.changeAppraisalType(appraisal.appraisalType);
        navigate(`/appraisal/${appraisal._id}/upload`);
    };

    const openAppraisal = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        itemClicked();
    };

    const removeAppraisal = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (window.confirm(`Are you sure you want to delete “${appraisal.name}”?`)) {
            deleteAppraisal(appraisal);
        }
    };

    return <tr className="appraisal-list-item">
        <td>{appraisal.name}</td>
        <td>{appraisal.address}</td>
        <td className="action-column">
            <Button color="primary" onClick={openAppraisal} aria-label={`Open ${appraisal.name}`}>Open</Button>
            {' '}
            <Button
                color="danger"
                onClick={removeAppraisal}
                aria-label={`Delete ${appraisal.name}`}
                className="icon-button"
            >
                <i className="fa fa-trash-alt" aria-hidden="true" />
            </Button>
        </td>
    </tr>;
}

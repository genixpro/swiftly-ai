import {useEffect, useRef} from 'react';
import {Link} from 'react-router';
import type {NavigateFunction} from 'react-router';
import {Row} from 'reactstrap';
import {useAppraisals, useDeleteAppraisal} from '../api/hooks';
import type {AppraisalDTO} from '../api/types';
import ContentWrapper from '../components/Layout/ContentWrapper';
import AppraisalList from './components/AppraisalList';

interface ViewAllAppraisalsProps {
    navigate: NavigateFunction;
    search?: string;
}

export default function ViewAllAppraisals({navigate, search}: ViewAllAppraisalsProps) {
    const heading = useRef<HTMLHeadingElement>(null);
    const appraisals = useAppraisals();
    const removeAppraisal = useDeleteAppraisal();

    useEffect(() => {
        document.title = 'Appraisals – Swiftly';
        heading.current?.focus();
    }, []);

    const deleteAppraisal = (appraisal: AppraisalDTO) => {
        void removeAppraisal.mutateAsync(appraisal._id);
    };

    return <ContentWrapper>
        <div className="content-heading"><div>
            <h1 className="page-title" tabIndex={-1} ref={heading}>View All Appraisals</h1>
            <ol className="breadcrumb breadcrumb px-0 pb-0" aria-label="Breadcrumb">
                <li className="breadcrumb-item"><Link to="/appraisals/">Home</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Appraisals</li>
            </ol>
        </div></div>
        <Row><div className="col-12 col-xl-8">
            <AppraisalList appraisals={appraisals.data ?? []} navigate={navigate} search={search} deleteAppraisal={deleteAppraisal} />
        </div></Row>
    </ContentWrapper>;
}

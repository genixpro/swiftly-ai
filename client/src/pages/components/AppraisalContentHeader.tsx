import {useEffect, useRef} from 'react';
import {Link} from 'react-router';

interface HeaderAppraisal {
    _id: string;
    name?: string;
    address?: string;
}

interface AppraisalContentHeaderProps {
    appraisal?: HeaderAppraisal;
    title: string;
}

export default function AppraisalContentHeader({appraisal, title}: AppraisalContentHeaderProps) {
    const heading = useRef<HTMLHeadingElement>(null);
    const previousTitle = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!appraisal) return;
        document.title = `${title} – ${appraisal.name} – Swiftly`;
        if (previousTitle.current !== title) heading.current?.focus();
        previousTitle.current = title;
    }, [appraisal, title]);

    return <div className="content-heading">
        {appraisal ? <div>
            <h1 className="page-title" tabIndex={-1} ref={heading}>{appraisal.name} - {appraisal.address} - {title}</h1>
            <ol className="breadcrumb breadcrumb px-0 pb-0" aria-label="Breadcrumb">
                <li className="breadcrumb-item"><Link to="/appraisals/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/appraisals/">Appraisals</Link></li>
                <li className="breadcrumb-item"><Link to={`/appraisal/${appraisal._id}/upload`}>{appraisal.name}</Link></li>
                <li className="breadcrumb-item active" aria-current="page">{title}</li>
            </ol>
        </div> : null}
    </div>;
}

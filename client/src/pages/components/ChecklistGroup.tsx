import type {PropsWithChildren} from 'react';
import {useState} from 'react';
import {Card, CardBody, CardHeader, CardTitle, Collapse} from 'reactstrap';

export default function ChecklistGroup({title, fileNames = [], children}: PropsWithChildren<{title: string; fileNames?: string[]}>) {
    const [detailsOpen, setDetailsOpen] = useState(true);
    const toggleAccordion = () => setDetailsOpen(open => !open);
    return <Card className="checklist-item">
        <CardHeader onClick={toggleAccordion} onKeyDown={event => (event.key === 'Enter' || event.key === ' ') && toggleAccordion()} role="button" tabIndex={0} aria-expanded={detailsOpen}>
            <CardTitle tag="h4">
                <span className="checklist-group-title">{title}</span>
                {fileNames.length > 0 ? <span className="checklist-spacer">&nbsp;-&nbsp;</span> : null}
                {fileNames.map((name, index) => <span key={`${name}-${index}`} className="checklist-file-name">{name}{index < fileNames.length - 1 ? ',  ' : ''}</span>)}
            </CardTitle>
        </CardHeader>
        <Collapse isOpen={detailsOpen}><CardBody>{children}</CardBody></Collapse>
    </Card>;
}

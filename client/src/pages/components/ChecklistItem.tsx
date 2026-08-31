interface ChecklistItemProps {
    completed: boolean;
    /** Retained because legacy callers supplied an unrendered description. */
    description?: string;
    title: string;
}

export default function ChecklistItem({completed, title}: ChecklistItemProps) {
    return <span>
        <small><i className={`fa fa-${completed ? 'check' : 'times'}`} /></small>
        &nbsp;&nbsp;
        <span>{title}</span>
        <br />
    </span>;
}

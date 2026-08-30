interface ChecklistItemProps {
    completed: boolean;
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

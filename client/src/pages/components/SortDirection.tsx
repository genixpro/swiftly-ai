export default function SortDirection({sort, field}: {sort?: string; field?: string}) {
    if (!sort || !field || sort.substring(1) !== field) return null;
    if (sort.includes('-')) return <i className="fa fa-arrow-down" style={{paddingLeft: '10px'}} />;
    if (sort.includes('+')) return <i className="fa fa-arrow-up" style={{paddingLeft: '10px'}} />;
    return null;
}

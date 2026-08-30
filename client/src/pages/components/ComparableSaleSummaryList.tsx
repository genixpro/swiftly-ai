import {Table} from 'reactstrap';
import '@components/Common/datetime-compat.css';

export default function ComparableSaleSummaryList({appraisal, allowSelection}: {appraisal?: unknown; allowSelection?: boolean}) {
    if (!appraisal) return null;
    return <Table hover={allowSelection} responsive className={`comparables-table ${allowSelection ? 'allow-selection' : ''}`}>
        <thead><tr className="header-row">
            <td><strong>Date</strong></td>
            <td><strong>Address</strong></td>
            <td><strong>Building Size (sf)</strong></td>
            <td><strong>Annual Net Rent (psf)</strong></td>
            <td className="action-column" />
        </tr></thead>
        <tbody />
    </Table>;
}

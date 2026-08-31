import {CardHeader, CardTitle, Row} from 'reactstrap';
import {ComparableSaleHeaderColumn} from './comparable-sale/ComparableSaleFields';
import {comparableSaleHeaderConfigurations} from './comparable-sale/headerConfigurations';
import type {ComparableSaleCardRecord} from '../../domain/comparableSaleCard';

interface ComparableSaleCardHeaderProps {
    comparableSale: ComparableSaleCardRecord;
    headers: string[][];
    openByDefault: boolean;
    detailsOpen: boolean;
    onToggle: () => void;
}

/** Header-only rendering that preserves the established expansion semantics. */
export default function ComparableSaleCardHeader({
    comparableSale,
    headers,
    openByDefault,
    detailsOpen,
    onToggle,
}: ComparableSaleCardHeaderProps) {
    if (!comparableSale._id || openByDefault) return null;

    const detailsId = `comparable-details-${String(comparableSale._id).replace(/[^a-z0-9_-]/gi, '-')}`;
    return <CardHeader className={"comparable-sale-list-item-header"}>
        <button
            type="button"
            className="comparable-expand-button"
            onClick={onToggle}
            aria-expanded={Boolean(detailsOpen)}
            aria-controls={detailsId}
        >
            <CardTitle tag="div">
                <Row>
                    {headers.map((headerFieldList, headerIndex) => <ComparableSaleHeaderColumn
                        key={headerIndex}
                        size={comparableSaleHeaderConfigurations[headerFieldList[0]].size}
                        renders={headerFieldList.map((field) => comparableSaleHeaderConfigurations[field].render)}
                        noValueTexts={headerFieldList.map((field) => comparableSaleHeaderConfigurations[field].noValueText)}
                        fields={headerFieldList}
                        spacers={headerFieldList.map((field) => comparableSaleHeaderConfigurations[field].spacer)}
                        comparableSale={comparableSale}
                    />)}
                </Row>
            </CardTitle>
        </button>
    </CardHeader>;
}

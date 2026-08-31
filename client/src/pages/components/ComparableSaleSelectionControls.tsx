import {Button} from 'reactstrap';
import type {ComparableSaleCardRecord} from '../../domain/comparableSaleCard';

interface ComparableSaleSelectionCallbacks {
    onAddComparableClicked?(comparableSale: ComparableSaleCardRecord): void;
    onRemoveComparableClicked?(comparableSale: ComparableSaleCardRecord): void;
}

interface ComparableSaleSelectionControlsProps {
    props: ComparableSaleSelectionCallbacks;
    comparableSale: ComparableSaleCardRecord;
    detailsOpen: boolean;
    includedInAppraisal: boolean;
    onDelete: () => void;
}

/** Existing appraisal-selection and deletion controls with no local state. */
export default function ComparableSaleSelectionControls({
    props,
    comparableSale,
    detailsOpen,
    includedInAppraisal,
    onDelete,
}: ComparableSaleSelectionControlsProps) {
    const deleteClass = `delete-comparable-button ${detailsOpen ? "" : "hidden"}`;

    if (props.onRemoveComparableClicked && includedInAppraisal) {
        return <div className={`comparable-button-row`}>
            <Button color={"primary"} onClick={() => props.onRemoveComparableClicked!(comparableSale)} className={"move-comparable-button"} title="Included in appraisal" aria-label="Remove comparable sale from appraisal">
                <i className={"fa fa-check-square"} />
            </Button>
            <Button color={"danger"} onClick={onDelete} className={deleteClass} title="Delete comparable sale" aria-label="Delete comparable sale">
                <i className={"fa fa-trash-alt"} />
            </Button>
        </div>;
    }

    if (props.onAddComparableClicked && !includedInAppraisal) {
        return <div className={`comparable-button-row`}>
            <Button color={"primary"} onClick={() => props.onAddComparableClicked!(comparableSale)} className={"move-comparable-button"} title="Not included in appraisal" aria-label="Add comparable sale to appraisal">
                <i className={"fa fa-square"} />
            </Button>
            <Button color={"danger"} onClick={onDelete} className={deleteClass} title="Delete comparable sale" aria-label="Delete comparable sale">
                <i className={"fa fa-trash-alt"} />
            </Button>
        </div>;
    }

    return null;
}

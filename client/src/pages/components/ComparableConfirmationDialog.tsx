import {useState} from 'react';
import {Col, Modal, ModalBody, ModalHeader, Row, Table} from 'reactstrap';
import {useCreateComparableSale, useUpdateComparableSale} from '@api/hooks';
import ActionButton from './ActionButton';
import ComparableSaleListItem from './ComparableSaleListItem';
import FileViewer from './FileViewer';
import type {FileViewerDocument} from './FileViewer';
import type {ComparableSaleCardRecord} from '../../domain/comparableSaleCard';

type UploadedComparable = ComparableSaleCardRecord & {_id?: string | null};

interface ComparableConfirmationDialogProps {
    appraisal: unknown;
    comparableSales?: UploadedComparable[];
    file?: FileViewerDocument | null;
    onChange(comparables: UploadedComparable[]): void;
    toggle(): void;
    uploading?: boolean;
    visible?: boolean;
}

export default function ComparableConfirmationDialog({
    appraisal,
    comparableSales = [],
    file,
    onChange,
    toggle,
    uploading,
    visible,
}: ComparableConfirmationDialogProps) {
    const [selectedComp, setSelectedComp] = useState(0);
    const createComparableSale = useCreateComparableSale();
    const updateComparableSale = useUpdateComparableSale();

    const changeComparable = (comparableIndex: number, nextComparable: UploadedComparable) => {
        comparableSales[comparableIndex] = nextComparable;
        onChange(comparableSales);
        return nextComparable._id
            ? updateComparableSale.mutateAsync({id: nextComparable._id, payload: nextComparable})
            : Promise.resolve();
    };

    const saveUploadedComparable = async (comparableIndex: number) => {
        const comparable = comparableSales[comparableIndex];
        if (comparable._id) return changeComparable(comparableIndex, comparable);

        try {
            const comparableId = await createComparableSale.mutateAsync(comparable);
            comparable._id = comparableId;
            Reflect.set(comparable, ComparableSaleListItem._newSale, true);
            onChange(comparableSales);
        } catch {
            // Preserve the existing dialog behavior: save failures leave the review open.
        }
    };

    return <Modal isOpen={visible} toggle={toggle} className="comparable-confirmation-dialog">
        <ModalHeader toggle={toggle}>Upload Comparable Sales</ModalHeader>
        <ModalBody>
            <Row>
                {uploading ? <Col xs={12}><div><div className="comparable-confirmation-dialog-loader ball-pulse"><div></div><div></div><div></div></div></div></Col> : null}
                {comparableSales.length > 0 ? <Col xs={2}>
                    <Table hover>
                        <thead><tr><th>Address</th></tr></thead>
                        <tbody>{comparableSales.map((comparable, comparableIndex) => <tr
                            key={comparable._id || comparableIndex}
                            className={`comp-row ${comparableIndex === selectedComp ? 'selected' : ''}`}
                            onClick={() => setSelectedComp(comparableIndex)}
                        >
                            <td>{comparable.address ? comparable.address : 'No address'}</td>
                            <td>{comparable._id ? <i className="fa fa-check-circle"/> : <i className="fa fa-exclamation-circle"/>}</td>
                        </tr>)}</tbody>
                    </Table>
                </Col> : null}
                {comparableSales.map((comparable, comparableIndex) => comparableIndex === selectedComp ? <Col xs={6} key={comparable._id || comparableIndex}>
                    <Row><Col xs={12}><ComparableSaleListItem
                        appraisal={appraisal}
                        headers={[]}
                        comparableSale={comparable}
                        openByDefault
                        onChange={(nextComparable: UploadedComparable) => changeComparable(selectedComp, nextComparable)}
                    /></Col></Row>
                    <Row><Col xs={12}><div className="bottom-button-area"><ActionButton color="primary" onClick={() => saveUploadedComparable(selectedComp)}>Save</ActionButton></div></Col></Row>
                </Col> : null)}
                {comparableSales.length > 0 && file ? <Col xs={4}><FileViewer document={file}/></Col> : null}
            </Row>
        </ModalBody>
    </Modal>;
}

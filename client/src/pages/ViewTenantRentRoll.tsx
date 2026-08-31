import {useEffect, useRef, useState} from 'react';
import {Alert, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row} from 'reactstrap';
import {reportUrl} from '@api/client';
import {useConvertTenants, useFile} from '@api/hooks';
import '@components/Common/datetime-compat.css';
import {
    appendRentRollUnit,
    defaultRentRollSource,
    removeRentRollUnit,
    rentRollQueryValue,
    reorderRentRollUnits,
    replaceRentRollUnit,
} from '../domain/rentRoll';
import ActionButton from './components/ActionButton';
import FileSelector from './components/FileSelector';
import FileViewer from './components/FileViewer';
import UnitsTable from './components/UnitsTable';
import {setBrowserLocation} from '../components/platform/browserActions';
import type {UnitDTO} from '../api/types';

type RentRollUnit = UnitDTO;

interface RentRollAppraisal {
    _id: string;
    units: RentRollUnit[];
    dataTypeReferences: Record<string, Array<{fileId?: string; pageNumbers?: number[]}>>;
    [field: string]: unknown;
}

interface RentRollState {
    downloadDropdownOpen?: boolean;
    hoverReference?: {wordIndexes?: number[]};
    initialOpenUnit?: string;
    selectedFileId?: string;
}

interface ViewTenantsRentRollProps {
    appraisal: RentRollAppraisal;
    navigate?: unknown;
    saveAppraisal(appraisal: RentRollAppraisal): void;
    search: string;
}

export default function ViewTenantsRentRoll(props: ViewTenantsRentRollProps) {
    const [state, setState] = useState<RentRollState>({});
    const selectedFileQuery = useFile(props.appraisal._id, state.selectedFileId ?? '');
    const convertTenants = useConvertTenants();
    const searchRef = useRef(props.search);
    // The legacy route intentionally has no unit-click handler. Preserve the
    // existing callback path until a separately approved behavior fix.
    const onUnitClicked: ((unitIndex: number) => void) | undefined = undefined;
    const updateState = (updates: Partial<RentRollState>) => setState((currentState) => ({...currentState, ...updates}));
    const saveUnits = (units: RentRollUnit[]) => {
        props.appraisal.units = units;
        props.saveAppraisal(props.appraisal);
    };
    const getDefaultFile = () => defaultRentRollSource(props.appraisal.dataTypeReferences);

    useEffect(() => {
        const initialOpenUnit = rentRollQueryValue(searchRef.current, 'unit');
        if (initialOpenUnit) setState((currentState) => ({...currentState, initialOpenUnit}));
    }, []);

    const onFileChanged = (fileId: string) => {
        updateState({selectedFileId: fileId});
    };

    return <div id="view-tenants-rent-roll" className="view-tenants-rent-roll">
        <Row>
            <Col xs={6}><h3>View Tenants</h3></Col>
            <Col xs={6} className="button-bar">
                <ActionButton onClick={() => convertTenants.mutateAsync(props.appraisal._id)} color="primary">
                    Add Tenancies to your Comparable Leases Database
                </ActionButton>
                <Dropdown isOpen={state.downloadDropdownOpen} toggle={() => updateState({downloadDropdownOpen: !state.downloadDropdownOpen})}>
                    <DropdownToggle caret color="primary" className="download-dropdown-button">Download</DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={() => { setBrowserLocation(reportUrl(props.appraisal._id, 'tenants', 'word')); }}>Tenants Summary (docx)</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </Col>
        </Row>
        {props.appraisal.units.length === 0 ? <Alert color="danger">There is no Rent Roll on file.</Alert> : null}
        <Row>
            <Col xs={6} md={6} lg={6} xl={6}>
                <UnitsTable
                    appraisal={props.appraisal}
                    initialOpenUnit={state.initialOpenUnit}
                    onUnitClicked={(_unit: RentRollUnit, unitIndex: number) => onUnitClicked!(unitIndex)}
                    onRemoveUnit={(unitIndex: number) => saveUnits(removeRentRollUnit(props.appraisal.units, unitIndex))}
                    onCreateUnit={(newUnit: RentRollUnit) => saveUnits(appendRentRollUnit(props.appraisal.units, newUnit))}
                    onUnitChanged={(unitIndex: number, newUnit: RentRollUnit) => saveUnits(replaceRentRollUnit(props.appraisal.units, unitIndex, newUnit))}
                    onChangeUnitOrder={(newUnits: RentRollUnit[]) => saveUnits(reorderRentRollUnits(newUnits))}
                    navigate={props.navigate}
                    search={props.search}
                />
            </Col>
            <Col xs={6} md={6} lg={6} xl={6}>
                <Row className="file-selector-row"><Col xs={12}>
                    <FileSelector
                        appraisalId={props.appraisal._id}
                        onChange={onFileChanged}
                        defaultFile={getDefaultFile().fileId}
                        value={state.selectedFileId || ''}
                    />
                </Col></Row>
                <Row>{selectedFileQuery.data ? <Col xs={12}>
                    <FileViewer
                        document={selectedFileQuery.data}
                        defaultPage={selectedFileQuery.data._id === getDefaultFile().fileId ? getDefaultFile().page ?? 0 : 0}
                        hilightWords={state.hoverReference?.wordIndexes ?? []}
                    />
                </Col> : null}</Row>
            </Col>
        </Row>
    </div>;
}

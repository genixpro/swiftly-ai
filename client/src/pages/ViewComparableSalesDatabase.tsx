import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Button, Col, Row} from 'reactstrap';
import type {AppraisalFieldUpdate, EditableAppraisal} from '../app/AppraisalWorkspace';
import {mapSeries} from '@utils/promises';
import {useComparableSales, useImportComparableSales} from '@api/hooks';
import {comparableImportForm} from '../domain/comparableImport';
import {addComparableId, comparableSearchRequest, defaultComparableSearch, removeComparableId, type ComparableSearch} from '../domain/comparables';
import ComparableConfirmationDialog from './components/ComparableConfirmationDialog';
import ComparableSaleList from './components/ComparableSaleList';
import ComparableSaleSearch from './components/ComparableSaleSearch';
import ComparableSalesMap from './components/ComparableSalesMap';
import Toolbar from './components/Toolbar';
import {chooseBrowserFiles} from '../components/platform/browserFilePicker';
import type {FileDTO} from '../api/types';
import type {ComparableSaleCardRecord} from '../domain/comparableSaleCard';

type LegacyComparable = ComparableSaleCardRecord & {_id: string};
interface Props {
    appraisal: EditableAppraisal;
    appraisalId: string;
    navigate?: unknown;
    search?: unknown;
    updateAppraisal(fields: AppraisalFieldUpdate): void;
}

export default function ViewComparableSalesDatabase({appraisal, appraisalId, navigate, search, updateAppraisal}: Props) {
    const [comparableSales, setComparableSales] = useState<LegacyComparable[]>([]);
    const [sort, setSort] = useState('-saleDate');
    const [uploading, setUploading] = useState(false);
    const [showUploadedComparablesDialog, setShowUploadedComparablesDialog] = useState(false);
    const [uploadedComparables, setUploadedComparables] = useState<LegacyComparable[]>([]);
    const [uploadedFile, setUploadedFile] = useState<FileDTO | null>(null);
    const [queryFilters, setQueryFilters] = useState<Record<string, unknown> | null>(null);
    const searchRef = useRef<ComparableSearch>({});
    const mapSearchRef = useRef<ComparableSearch>({});
    const defaultSearch = useMemo(() => defaultComparableSearch('saleDateFrom', appraisal.propertyType), [appraisal.propertyType]);

    useEffect(() => { searchRef.current = defaultSearch; }, [defaultSearch]);

    const comparableSalesQuery = useComparableSales(queryFilters ?? {}, {enabled: queryFilters !== null});
    const importComparableSales = useImportComparableSales();

    const loadData = useCallback((nextSort = sort) => {
        setQueryFilters(comparableSearchRequest(searchRef.current, mapSearchRef.current, nextSort));
    }, [sort]);

    useEffect(() => {
        if (!comparableSalesQuery.data) return;
        setComparableSales(comparableSalesQuery.data as LegacyComparable[]);
    }, [comparableSalesQuery.data]);

    const selectedCapRateIds = (appraisal.comparableSalesCapRate ?? []) as string[];
    const selectedDcaIds = (appraisal.comparableSalesDCA ?? []) as string[];
    const addComparableToAppraisal = (sale: LegacyComparable) => updateAppraisal({
        comparableSalesCapRate: addComparableId(selectedCapRateIds, sale._id),
        comparableSalesDCA: addComparableId(selectedDcaIds, sale._id),
    });
    const removeComparableFromAppraisal = (sale: LegacyComparable) => updateAppraisal({
        comparableSalesCapRate: removeComparableId(selectedCapRateIds, sale._id),
        comparableSalesDCA: removeComparableId(selectedDcaIds, sale._id),
    });
    const addComparableToDca = (sale: LegacyComparable) => updateAppraisal({comparableSalesDCA: addComparableId(selectedDcaIds, sale._id)});
    const removeComparableFromDca = (sale: LegacyComparable) => updateAppraisal({comparableSalesDCA: removeComparableId(selectedDcaIds, sale._id)});
    const addComparableToCapRate = (sale: LegacyComparable) => updateAppraisal({comparableSalesCapRate: addComparableId(selectedCapRateIds, sale._id)});
    const removeComparableFromCapRate = (sale: LegacyComparable) => updateAppraisal({comparableSalesCapRate: removeComparableId(selectedCapRateIds, sale._id)});

    const uploadClicked = () => {
        chooseBrowserFiles(async (files) => {
            setUploading(true); setShowUploadedComparablesDialog(true); setUploadedComparables([]); setUploadedFile(null);
            try {
                const results = await mapSeries(files, async (file: File) => {
                    try {
                        const result = await importComparableSales.mutateAsync(comparableImportForm(file));
                        return {comps: result.comparableSales, file: result.file};
                    } catch {
                        // Keep processing later selected files before the legacy assembly step fails.
                        return null;
                    }
                }) as Array<{comps: LegacyComparable[]; file: FileDTO} | null>;
                const comps = results.flatMap(result => result!.comps);
                setUploadedFile(results[0]!.file);
                setUploadedComparables(comps);
            } catch {
                // Existing behavior leaves the dialog open and stops its loader when import fails.
            } finally {
                setUploading(false);
            }
        });
    };

    return <div className="view-comparables-database">
        <Row><Col xs={10}><h3>Search for Comparables</h3></Col><Col xs={2}><Toolbar><Button color="primary" onClick={uploadClicked}>Upload</Button></Toolbar></Col></Row>
        <ComparableSaleSearch appraisal={appraisal} onChange={(nextSearch: ComparableSearch) => { searchRef.current = nextSearch; void loadData(); }} defaultSearch={defaultSearch}/>
        <Row><Col xs={8}><ComparableSaleList
            comparableSales={comparableSales} statsTitle="Region Statistics" allowNew sort={sort}
            onSortChanged={(nextSort: string) => { setSort(nextSort); void loadData(nextSort); }} navigate={navigate} search={search as Record<string, unknown>}
            appraisal={appraisal} appraisalId={appraisalId} appraisalComparables={appraisal.comparableSales}
            onAddComparableClicked={addComparableToAppraisal} onRemoveComparableClicked={removeComparableFromAppraisal}
            onNewComparable={(sale: LegacyComparable) => setComparableSales(current => [sale, ...current])}
            onChange={(sales: LegacyComparable[]) => setComparableSales(sales)}
            onRemoveDCAClicked={removeComparableFromDca} onRemoveCapRateClicked={removeComparableFromCapRate}
            onAddDCAClicked={addComparableToDca} onAddCapRateClicked={addComparableToCapRate}
        /></Col><Col xs={4}><ComparableSalesMap appraisal={appraisal} comparableSales={comparableSales}
            onMapSearchChanged={(nextSearch: ComparableSearch) => { mapSearchRef.current = nextSearch; void loadData(); }}
            onAddComparableToAppraisal={addComparableToAppraisal} onRemoveComparableFromAppraisal={removeComparableFromAppraisal}/>
        </Col></Row>
        <Row><Col><ComparableConfirmationDialog appraisal={appraisal} comparableSales={uploadedComparables} file={uploadedFile}
            visible={showUploadedComparablesDialog} uploading={uploading} toggle={() => setShowUploadedComparablesDialog(current => !current)}
            onChange={(sales: LegacyComparable[]) => setUploadedComparables(sales)}/></Col></Row>
    </div>;
}

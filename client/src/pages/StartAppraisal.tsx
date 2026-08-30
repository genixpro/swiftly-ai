import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {Card, CardBody, FormGroup, Input, Row} from 'reactstrap';
import {useCreateAppraisal} from '@api/hooks';
import {useAppraisalNavigation} from '../app/AppraisalNavigation';
import ContentWrapper from '../components/Layout/ContentWrapper';
import FieldDisplayEdit from './components/FieldDisplayEdit';

type AppraisalType = 'simple' | 'detailed';

interface NewAppraisal {
    name: string;
    address: string;
    appraisalType?: AppraisalType | null;
    effectiveDate?: unknown;
    propertyType?: unknown;
    propertyTags?: unknown;
    location?: {type: 'Point'; coordinates: [number, number]};
    [field: string]: unknown;
}

interface StartAppraisalProps {
    navigate(path: string): void;
    edit?: boolean;
}

export default function StartAppraisal({navigate, edit}: StartAppraisalProps) {
    const navigation = useAppraisalNavigation();
    const createMutation = useCreateAppraisal();
    const heading = useRef<HTMLHeadingElement>(null);
    const [mode, setMode] = useState<'type' | 'fields'>('type');
    const [newAppraisal, setNewAppraisal] = useState<NewAppraisal>({name: '', address: ''});
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    useEffect(() => {
        document.title = 'Start an Appraisal – Swiftly';
        heading.current?.focus();
    }, []);

    const updateValue = (field: string, value: unknown) => {
        setNewAppraisal(current => ({...current, [field]: value}));
    };

    const appraisalTypeSelected = (type: AppraisalType) => {
        setNewAppraisal(current => {
            if (current.appraisalType === type) {
                setMode('type');
                return {...current, appraisalType: null};
            }
            setMode('fields');
            return {...current, appraisalType: type};
        });
    };

    const createAppraisal = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!newAppraisal.name.trim()) {
            setCreateError('Enter a name for the appraisal.');
            return;
        }

        setCreating(true);
        setCreateError(null);
        try {
            const newId = await createMutation.mutateAsync(newAppraisal);
            navigation.changeAppraisalType(newAppraisal.appraisalType);
            navigate(`/appraisal/${newId}/upload`);
        } catch {
            setCreating(false);
            setCreateError("The appraisal couldn't be created. Check the local API and try again.");
        }
    };

    const showSimple = mode === 'type' || newAppraisal.appraisalType === 'simple';
    const showDetailed = mode === 'type' || newAppraisal.appraisalType === 'detailed';

    return <ContentWrapper>
        <div className="start-appraisal">
            <div className="content-heading">
                <div>
                    <h1 className="page-title" tabIndex={-1} ref={heading}>Start a New Appraisal</h1>
                    <ol className="breadcrumb breadcrumb px-0 pb-0" aria-label="Breadcrumb">
                        <li className="breadcrumb-item"><Link to="/appraisals/">Home</Link></li>
                        <li className="breadcrumb-item"><Link to="/appraisals/">Appraisals</Link></li>
                        <li className="breadcrumb-item active" aria-current="page">New Appraisal</li>
                    </ol>
                </div>
            </div>
            <Row>
                <div className="selector-fields-wrapper">
                    <div className="appraisal-type-selector">
                        {showSimple ? <AppraisalTypeOption
                            type="simple"
                            title="Start a Short Appraisal"
                            icon="fas fa-file-alt"
                            columns={[
                                ['Basic Rent Roll', 'Stabilized Statement', 'Comparable Sales'],
                                ['Comparable Leases', 'Capitalization Approach', 'Direct Comparison Approach'],
                            ]}
                            onSelect={appraisalTypeSelected}
                        /> : null}
                        {showDetailed ? <AppraisalTypeOption
                            type="detailed"
                            title="Start a Detailed Appraisal"
                            icon="fas fa-copy"
                            columns={[
                                ['Full Rent Roll', 'Market Rents', 'Leasing Cost Structures', 'Recovery Structures', 'Detailed Expenses', 'Additional Income'],
                                ['Amortization', 'Stabilized Statement', 'Comparable Sales', 'Comparable Leases', 'Capitalization Approach', 'Direct Comparison Approach'],
                            ]}
                            onSelect={appraisalTypeSelected}
                        /> : null}
                    </div>
                    {mode === 'fields' ? <div className="appraisal-fields-area">
                        <Card className="card-default"><CardBody>
                            <form onSubmit={createAppraisal}>
                                {createError ? <div className="alert alert-warning" role="alert">{createError}</div> : null}
                                <FormGroup>
                                    <label htmlFor="new-appraisal-name">Name</label>
                                    <Input id="new-appraisal-name" type="text" placeholder="Name" required onChange={event => updateValue('name', event.target.value)} value={newAppraisal.name} />
                                </FormGroup>
                                <AppraisalField label="Street Address"><FieldDisplayEdit
                                    type="address" edit={edit} hideInput={false} hideIcon placeholder="Address" value={newAppraisal.address}
                                    onChange={(value: unknown) => updateValue('address', value)}
                                    onGeoChange={(value: {lng: number; lat: number}) => updateValue('location', {type: 'Point', coordinates: [value.lng, value.lat]})}
                                /></AppraisalField>
                                <AppraisalField label="Effective Date"><FieldDisplayEdit type="date" edit={edit} hideInput={false} hideIcon placeholder="Effective Date" value={newAppraisal.effectiveDate} onChange={(value: unknown) => updateValue('effectiveDate', value)} /></AppraisalField>
                                <AppraisalField label="Property Type"><FieldDisplayEdit type="propertyType" edit={edit} hideInput={false} hideIcon placeholder="Property Type" value={newAppraisal.propertyType} onChange={(value: unknown) => updateValue('propertyType', value)} /></AppraisalField>
                                <AppraisalField label="Sub Type"><FieldDisplayEdit type="tags" edit={edit} hideInput={false} hideIcon placeholder="Sub Type" value={newAppraisal.propertyTags} onChange={(value: unknown) => updateValue('propertyTags', value)} /></AppraisalField>
                                <button className="btn btn-sm btn-primary" type="submit" disabled={creating}>{creating ? 'Creating…' : 'Create'}</button>
                            </form>
                        </CardBody></Card>
                    </div> : null}
                </div>
            </Row>
        </div>
    </ContentWrapper>;
}

function AppraisalTypeOption({type, title, icon, columns, onSelect}: {
    type: AppraisalType;
    title: string;
    icon: string;
    columns: string[][];
    onSelect(type: AppraisalType): void;
}) {
    const select = () => onSelect(type);
    return <div className="appraisal-type-option" role="button" tabIndex={0} onClick={select} onKeyDown={event => (event.key === 'Enter' || event.key === ' ') && select()}>
        <Card outline color="primary" className="appraisal-type-button">
            <em className={`type-icon fa-2x ${icon} me-2`} />
            <div className="description-block">
                <div className="title-wrapper"><span className="title">{title}</span></div>
                <div className="features-list-wrapper">
                    {columns.map((column, index) => <ul key={index}>{column.map(item => <li key={item}>{item}</li>)}</ul>)}
                </div>
            </div>
        </Card>
    </div>;
}

function AppraisalField({label, children}: {label: string; children: React.ReactNode}) {
    return <FormGroup><label>{label}</label>{children}</FormGroup>;
}

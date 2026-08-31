import React from 'react';
import {Button} from 'reactstrap';
import FieldDisplayEdit from './FieldDisplayEdit';
import UploadableImageSet from './UploadableImageSet';
import ComparableSalePortfolioSelector from './ComparableSalePortfolioSelector';
import ComparableSaleMapPicker from './ComparableSaleMapPicker';
import ComparableSaleStabilizedNoiPopover from './ComparableSaleStabilizedNoiPopover';
import ComparableSaleIdentityFields from './ComparableSaleIdentityFields';
import ComparableSaleSalesFields from './ComparableSaleSalesFields';
import ComparableSaleBuildingFields from './ComparableSaleBuildingFields';
import type {ComparableSaleCardRecord} from '../../domain/comparableSaleCard';

interface ComparableSaleDetailContentProps {
    comparableSale: ComparableSaleCardRecord;
    comparableSaleSource: ComparableSaleCardRecord;
    editable: boolean;
    includedInCapRate: boolean;
    includedInDCA: boolean;
    itemProps: {
        appraisal?: unknown;
        comparableSale: ComparableSaleCardRecord;
        edit: boolean;
        onAddCapRateClicked?(comparableSale: ComparableSaleCardRecord): void;
        onAddDCAClicked?(comparableSale: ComparableSaleCardRecord): void;
        onRemoveCapRateClicked?(comparableSale: ComparableSaleCardRecord): void;
        onRemoveDCAClicked?(comparableSale: ComparableSaleCardRecord): void;
    };
    mapParams: {defaultCenter: {lat: number; lng: number}; defaultZoom: number};
    onAddPortfolioEntry(): void;
    onChange(field: string, value: unknown): void;
    onDeletePortfolioEntry(index: number, event: React.SyntheticEvent): void;
    onMapClick(event: {lng: number; lat: number}): void;
    onMapMouseLeave(): void;
    onMapMouseMove(event: React.MouseEvent<HTMLElement>): void;
    onSelectPortfolioEntry(index: number): void;
    onToggleMap(): void;
    onToggleStabilizedNoi(): void;
    pin: {droppingPinX: number; droppingPinY: number; isDraggingPin: boolean; open: boolean; popoverId: string};
    portfolio: {comps: ComparableSaleCardRecord[]; selected: number};
    stabilizedNoi: {open: boolean; popoverId: string};
}

/** Presentation-only portion of a comparable sale's expanded card. */
function ComparableSaleDetailContent({
    comparableSale,
    comparableSaleSource,
    editable,
    includedInCapRate,
    includedInDCA,
    itemProps,
    mapParams,
    onAddPortfolioEntry,
    onChange,
    onDeletePortfolioEntry,
    onMapClick,
    onMapMouseLeave,
    onMapMouseMove,
    onSelectPortfolioEntry,
    onToggleMap,
    onToggleStabilizedNoi,
    pin,
    portfolio,
    stabilizedNoi,
}: ComparableSaleDetailContentProps) {
    return <div className={`card-body comparable-sale-list-item-body ${editable ? 'editable' : 'non-editable'}`}>
        <div className={"comparable-sale-list-item-left-column"}>
            <UploadableImageSet
                editable={editable}
                address={comparableSale.address as string | undefined}
                value={comparableSale.imageUrls as string[] | null | undefined}
                onChange={(newUrls: unknown) => onChange('imageUrls', newUrls)}
                captions={comparableSale.captions as string[] | null | undefined}
                onChangeCaptions={(newCaptions: unknown) => onChange('captions', newCaptions)}
            />

            {
                (itemProps.onRemoveDCAClicked || itemProps.onRemoveCapRateClicked) ?
                    <span>
                        <br/>
                        <h4>This Appraisal</h4>
                    </span>
                    : null
            }
            {
                itemProps.onRemoveDCAClicked ? <div className={"comparable-list-boxes"}>
                    <span>Include in Direct Comparison&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <FieldDisplayEdit
                        type={"boolean"}
                        hideIcon={true}
                        value={includedInDCA}
                        onChange={() => includedInDCA ? itemProps.onRemoveDCAClicked!(comparableSaleSource) : itemProps.onAddDCAClicked!(comparableSaleSource)}
                    />
                </div> : null
            }
            {
                itemProps.onRemoveCapRateClicked ? <div className={"comparable-list-boxes"}>
                    <span>Include in Capitalization Approach</span>
                    <FieldDisplayEdit
                        type={"boolean"}
                        hideIcon={true}
                        value={includedInCapRate}
                        onChange={() => includedInCapRate ? itemProps.onRemoveCapRateClicked!(comparableSaleSource) : itemProps.onAddCapRateClicked!(comparableSaleSource)}
                    />
                </div> : null
            }
            <ComparableSalePortfolioSelector
                isPortfolioCompilation={Boolean(itemProps.comparableSale.isPortfolioCompilation)}
                portfolioComps={portfolio.comps}
                selectedPortfolioComp={portfolio.selected}
                edit={itemProps.edit}
                onSelect={onSelectPortfolioEntry}
                onDelete={onDeletePortfolioEntry}
                onAdd={onAddPortfolioEntry}
            />
        </div>
        {
            itemProps.comparableSale.isPortfolioCompilation && portfolio.comps.length === 0 ?
                <div className={`no-comps-in-portfolio`}>
                    <Button color={'secondary'} className={"no-comps-in-portfolio-button"} onClick={onAddPortfolioEntry}>
                        <i className={"fa fa-plus"} />
                        <br />
                        <span>Add a Sale to this Portfolio</span>
                    </Button>
                </div>
                : null
        }
        {
            (itemProps.comparableSale.isPortfolioCompilation && portfolio.comps.length > 0) || (!itemProps.comparableSale.isPortfolioCompilation) ?
                <div className={`comparable-sale-content`}>
                    <div className={"comparable-fields-area"}>
                        <ComparableSaleIdentityFields
                            comparableSale={comparableSale}
                            appraisalLocation={(itemProps.appraisal as {location?: ComparableSaleCardRecord['location']}).location}
                            editable={editable}
                            selectedPortfolioComp={portfolio.selected}
                            mapPicker={editable ? <ComparableSaleMapPicker
                                comparableSale={comparableSale}
                                popoverId={pin.popoverId}
                                open={pin.open}
                                isDraggingPin={pin.isDraggingPin}
                                droppingPinX={pin.droppingPinX}
                                droppingPinY={pin.droppingPinY}
                                mapParams={mapParams}
                                onToggle={onToggleMap}
                                onMouseMove={onMapMouseMove}
                                onMouseLeave={onMapMouseLeave}
                                onMapClick={onMapClick}
                            /> : null}
                            onChange={onChange}
                        />

                        <ComparableSaleSalesFields
                            comparableSale={comparableSale}
                            editable={editable}
                            stabilizedNoiCalculator={<ComparableSaleStabilizedNoiPopover
                                comparableSale={comparableSale}
                                editable={editable}
                                popoverId={stabilizedNoi.popoverId}
                                open={stabilizedNoi.open}
                                onToggle={onToggleStabilizedNoi}
                                onChange={onChange}
                            />}
                            onChange={onChange}
                        />
                        <ComparableSaleBuildingFields
                            comparableSale={comparableSale}
                            editable={editable}
                            onChange={onChange}
                        />

                    </div>
                </div> : null
        }
    </div>;
}

export default ComparableSaleDetailContent;

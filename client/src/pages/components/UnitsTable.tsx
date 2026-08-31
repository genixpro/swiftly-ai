import React from 'react';
import {Table, Button, Collapse} from 'reactstrap';
import '@components/Common/datetime-compat.css'
import UnitDetailsEditor from "./UnitDetailsEditor";
import UnitsTableFooter from './UnitsTableFooter';
import {closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors} from '@dnd-kit/core';
import type {DragEndEvent, DraggableAttributes} from '@dnd-kit/core';
import type {SyntheticListenerMap} from '@dnd-kit/core/dist/hooks/utilities/useSyntheticListeners';
import {arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {
    averageCurrentRentPSF,
    totalStabilizedRent,
    totalUnitSize,
} from '../../domain/units';
import {createUnit} from '../../domain/appraisal';
import {defaultUnitFields, unitFieldConfiguration} from './unitsTableFields';
import {confirmBrowserAction} from '../../components/platform/browserActions';
import {setBrowserTimer} from '../../components/platform/browserTimers';
import type {UnitDTO} from '../../api/types';
import type {MarketRent} from '../../domain/marketRents';
import type {EditableAppraisal, EditableUnit} from './UnitDetailsEditor';

interface UnitTableAppraisal {
    marketRents?: MarketRent[] | null;
    units: UnitDTO[];
    [field: string]: unknown;
}

interface UnitTableProps {
    allowNewUnit?: boolean;
    allowSelection?: boolean;
    appraisal: UnitTableAppraisal;
    fields?: string[];
    initialOpenUnit?: string;
    navigate?: unknown;
    onChangeUnitOrder?(units: UnitDTO[]): void;
    onCreateUnit?(unit: UnitDTO): void;
    onRemoveUnit?(index: number): void;
    onUnitChanged?(index: number, unit: UnitDTO): void;
    onUnitClicked?(unit: UnitDTO, index: number): void;
    search?: string;
    showStabilizedStats?: boolean;
    statsMode?: 'all' | 'total';
}

type UnitFieldConfiguration = ReturnType<typeof unitFieldConfiguration>;

interface DragHandleProps {
    attributes?: DraggableAttributes;
    listeners?: SyntheticListenerMap;
}

interface UnitRowProps {
    allowSelection: boolean;
    appraisal: UnitTableAppraisal;
    dragHandleProps?: DragHandleProps;
    fieldConfiguration: UnitFieldConfiguration;
    fields: string[];
    onChangeUnit(unit: UnitDTO): void;
    onUnitClicked(unitNumber: string | number | undefined): void;
    removeUnit(unit: UnitDTO, index: number): void;
    rowRef?: (node: HTMLElement | null) => void;
    search?: string;
    sortableStyle?: React.CSSProperties;
    unit: UnitDTO;
    unitIndex: number;
}

const DragHandle = ({attributes, listeners}: DragHandleProps) => <button
    type="button"
    className="units-table-drag-handle"
    aria-label="Reorder unit"
    {...attributes}
    {...listeners}
><i className="fa fa-bars" aria-hidden="true"/></button>;

export function UnitRow(props: UnitRowProps) {
    const [state, setState] = React.useState({collapse: false, collapseAnimating: false});
    const initialPropsRef = React.useRef(props);

    React.useEffect(() => {
        const initialProps = initialPropsRef.current;
        if (initialProps.search == null || !initialProps.allowSelection) return;
        const query = initialProps.search.substring(1);
        const vars = query.split('&');
        let selectedUnit = "";
        for (let i = 0; i < vars.length; i++) {
            const pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) === "unit") {
                selectedUnit = decodeURIComponent(pair[1]);
                break;
            }
        }
        if (selectedUnit.toString() === (initialProps.unitIndex || "null").toString()) {
            setState((currentState) => ({...currentState, collapse: true}));
        }
    }, []);

    const toggleDetails = () => {
        setState((currentState) => ({...currentState, collapse: !currentState.collapse, collapseAnimating: true}));

        setBrowserTimer(() => {
            setState((currentState) => ({...currentState, collapseAnimating: false}));
        }, 750)
    };

    const onUnitClicked = () => {
        if (props.allowSelection) {
            toggleDetails();
        }
        else {
            props.onUnitClicked(props.unit.unitNumber);
        }
    };

        const unitInfo = props.unit;
        const unitIndex = props.unitIndex;

        let selectedClass = "";
        if (state.collapse)
        {
            selectedClass = " selected-unit-row";
        }

        return [<tr ref={props.rowRef} style={props.sortableStyle} onClick={() => onUnitClicked()} className={"unit-row " + selectedClass} key={0}>
            {
                props.allowSelection ?
                    <td>
                        <DragHandle {...props.dragHandleProps} />
                    </td> : null
            }
            {
                props.fields.map((field: string, fieldIndex: number) =>
                {
                    return <td key={fieldIndex} className={props.fieldConfiguration[field].className}>{props.fieldConfiguration[field].render(props.unit)}</td>;
                })
            }
            {props.allowSelection ? <td className={"action-column"}>
                <Button
                    color="secondary"
                    onClick={() => props.removeUnit(unitInfo, unitIndex)}
                    title={"Delete Unit"}
                >
                    <i className="fa fa-trash-alt"></i>
                </Button>
            </td> : null}
        </tr>,
            (props.allowSelection) ? <tr key={1} className={"unit-details-row"}>
                <td colSpan={props.fields.length + 2}>
                    <Collapse isOpen={state.collapse}>
                        {
                            state.collapse || state.collapseAnimating ?
                                <UnitDetailsEditor
                                    unit={props.unit as EditableUnit}
                                    appraisal={props.appraisal as EditableAppraisal}
                                    onChange={(newUnit) => props.onChangeUnit(newUnit)}
                                /> : null
                        }
                    </Collapse>
                </td>
            </tr> : null
        ];
}

interface SortableItemProps {
    allowSelection: boolean;
    appraisal: UnitTableAppraisal;
    fieldConfiguration: UnitFieldConfiguration;
    fields: string[];
    id: string;
    index: number;
    onChangeUnit(unit: UnitDTO): void;
    onUnitClicked(unitNumber: string | number | undefined): void;
    removeUnit(unit: UnitDTO, index: number): void;
    search?: string;
    value: UnitDTO;
}

function SortableItem({id, value, index, fields, fieldConfiguration, appraisal, onChangeUnit, onUnitClicked, removeUnit, allowSelection, search}: SortableItemProps) {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id});
    const sortableStyle = {transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.65 : undefined};
    return <UnitRow
        unit={value}
        unitIndex={index}
        onChangeUnit={onChangeUnit}
        fields={fields}
        appraisal={appraisal}
        fieldConfiguration={fieldConfiguration}
        onUnitClicked={onUnitClicked}
        removeUnit={removeUnit}
        allowSelection={allowSelection}
        search={search}
        rowRef={setNodeRef}
        sortableStyle={sortableStyle}
        dragHandleProps={{attributes, listeners}}
    />
}

interface SortableRowsProps {
    children: React.ReactNode;
    items: string[];
    onSortEnd(event: {oldIndex: number; newIndex: number}): void;
}

function SortableRows({items, onSortEnd, children}: SortableRowsProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {activationConstraint: {distance: 5}}),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
    );
    const handleDragEnd = ({active, over}: DragEndEvent) => {
        if (!over || active.id === over.id) return;
        onSortEnd({oldIndex: items.indexOf(String(active.id)), newIndex: items.indexOf(String(over.id))});
    };
    return <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        accessibility={{screenReaderInstructions: {draggable: 'Press space to pick up a unit. Use arrow keys to move it, then press space to drop.'}}}
    >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {children}
        </SortableContext>
    </DndContext>;
}



function UnitsTable(incomingProps: UnitTableProps) {
    const props = {
        ...incomingProps,
        allowSelection: incomingProps.allowSelection === undefined ? true : incomingProps.allowSelection,
        statsMode: incomingProps.statsMode === undefined ? 'all' : incomingProps.statsMode,
        allowNewUnit: incomingProps.allowNewUnit === undefined ? true : incomingProps.allowNewUnit,
    };
    const onUnitClicked = (unitNum: string | number | undefined) => {
        if (props.onUnitClicked)
        {
            let index = 0;
            for (const unit of props.appraisal.units)
            {
                if (unit.unitNumber === unitNum)
                {
                    props.onUnitClicked(unit, index);
                }
                index += 1;
            }
        }
    };
    const removeUnit = (_unitInfo: UnitDTO, unitIndex: number) => {
        if (props.onRemoveUnit)
        {
            if (confirmBrowserAction("Are you sure you want to delete the unit?"))
            {
                props.onRemoveUnit(unitIndex);
            }
        }
    };
    const createNewUnit = (field?: string, value?: unknown) => {
        if (props.onCreateUnit)
        {
            const newUnit: UnitDTO = {
                tenancies: []
            };

            if (field)
            {
                newUnit[field] = value;
            }

            const newUnitObj = createUnit(newUnit);

            newUnitObj.unitNumber = (newUnitObj.unitNumber as string) + " " + props.appraisal.units.length.toString();

            const newIndex = props.appraisal.units.length;

            props.onCreateUnit!(newUnitObj);
            props.onUnitClicked!(newUnitObj, newIndex);
        }
    };
    const onChangeUnit = (unitIndex: number, newUnit: UnitDTO) => {
        props.onUnitChanged!(unitIndex, newUnit);
    };
    const onSortEnd = ({oldIndex, newIndex}: {oldIndex: number; newIndex: number}) => {
        props.onChangeUnitOrder!(arrayMove(props.appraisal.units, oldIndex, newIndex));
    };
    const fieldConfiguration = unitFieldConfiguration(props.appraisal.marketRents);
    const fields: string[] = props.fields || defaultUnitFields(!!props.showStabilizedStats);
    const sortableIds = props.appraisal.units.map((unit, index) => `unit-${String(unit._id || unit.unitNumber || 'row')}-${index}`);

    return (
            (props.appraisal) ?
                <div>
                <SortableRows items={sortableIds} onSortEnd={onSortEnd}>
                <Table hover={!!props.onUnitClicked} responsive className={"units-table " + (props.onUnitClicked ? "allow-selection" : "")}>
                    <thead>
                    <tr className={"header-row"}>
                        {
                            props.allowSelection ? <td /> : null
                        }
                        {
                            fields.map((field: string, fieldIndex: number) =>
                            {
                                return <td key={fieldIndex} className={fieldConfiguration[field].className}><strong>{fieldConfiguration[field].title}</strong></td>;
                            })
                        }
                        {props.onUnitClicked ? <td className={"action-column"} /> : null}
                    </tr>

                    </thead>

                    <tbody>
                        {props.appraisal.units.map((unit, unitIndex) => (
                            <SortableItem
                                key={`unit-${unitIndex}`}
                                id={sortableIds[unitIndex]}
                                index={unitIndex}
                                value={unit}
                                fields={fields}
                                appraisal={props.appraisal}
                                onChangeUnit={(newUnit) => onChangeUnit(unitIndex, newUnit)}
                                fieldConfiguration={fieldConfiguration}
                                onUnitClicked={onUnitClicked}
                                removeUnit={removeUnit}
                                allowSelection={props.allowSelection}
                                search={props.search}

                            />
                        ))}
                    </tbody>
                    <UnitsTableFooter
                        allowNewUnit={props.allowNewUnit}
                        allowSelection={props.allowSelection}
                        averageRentPSF={averageCurrentRentPSF(props.appraisal.units as import('../../domain/units').UnitForTotals[])}
                        onCreateUnit={() => createNewUnit()}
                        statsMode={props.statsMode}
                        totalSize={totalUnitSize(props.appraisal.units as import('../../domain/units').UnitForTotals[])}
                        totalStabilizedRent={totalStabilizedRent(props.appraisal.units as import('../../domain/units').UnitForTotals[])}
                    />
                </Table>
                </SortableRows>
                </div>
                : null
    );
}

export default UnitsTable;

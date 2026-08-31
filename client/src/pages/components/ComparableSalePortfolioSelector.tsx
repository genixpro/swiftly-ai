import React from 'react';
import {Button, Table} from 'reactstrap';
import type {ComparableSaleCardRecord} from '../../domain/comparableSaleCard';

interface ComparableSalePortfolioSelectorProps {
    isPortfolioCompilation: boolean;
    portfolioComps: ComparableSaleCardRecord[];
    selectedPortfolioComp: number;
    edit: boolean;
    onSelect: (index: number) => void;
    onDelete: (index: number, event: React.SyntheticEvent) => void;
    onAdd: () => void;
}

/** Existing portfolio selection table; state and persistence stay in its parent. */
export default function ComparableSalePortfolioSelector({
    isPortfolioCompilation,
    portfolioComps,
    selectedPortfolioComp,
    edit,
    onSelect,
    onDelete,
    onAdd,
}: ComparableSalePortfolioSelectorProps) {
    return <>
        <br/><br/>
        <h4>Portfolio</h4>
        {isPortfolioCompilation ? <div>
            <Table striped className={"portfolio-table"}>
                <tbody>
                    <tr className={`comp-selection-row ${selectedPortfolioComp === -1 ? 'selected' : ''}`} onClick={() => onSelect(-1)}>
                        <td className={"arrow-column"}>{selectedPortfolioComp === -1 ? <i className={"fa fa-arrow-right"} /> : null}</td>
                        <td className={"portfolio-number-column"} />
                        <td className={"portfolio-address-column"}>Compilation</td>
                        <td className={"portfolio-action-column"}/>
                    </tr>
                    {portfolioComps.map((portfolioComp, portfolioIndex) => <tr
                        key={portfolioIndex}
                        className={`comp-selection-row ${portfolioIndex === selectedPortfolioComp ? 'selected' : ''}`}
                        onClick={() => onSelect(portfolioIndex)}
                    >
                        <td className={"arrow-column"}>{selectedPortfolioComp === portfolioIndex ? <i className={"fa fa-arrow-right"} /> : null}</td>
                        <td className={"portfolio-number-column"}>#{portfolioIndex + 1}</td>
                        <td className={"portfolio-address-column"}>{portfolioComp.address || <span className={"no-data"}>No Address</span>}</td>
                        <td className={"portfolio-action-column"}>
                            <div className={"action-button-wrapper"}>
                                <Button className={""} color={'danger'} onClick={(event) => onDelete(portfolioIndex, event)}><i className={"fa fa-trash"} /></Button>
                            </div>
                        </td>
                    </tr>)}
                    {edit ? <tr>
                        <td className={"arrow-column"}/>
                        <td className={"portfolio-number-column"}/>
                        <td className={"portfolio-address-column"}><Button onClick={onAdd}>Add Entry In Portfolio</Button></td>
                        <td className={"portfolio-action-column"}/>
                    </tr> : null}
                </tbody>
            </Table>
        </div> : null}
    </>;
}

import React from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import CurrencyFormat from "./CurrencyFormat";
import PercentFormat from "./PercentFormat";
import IntegerFormat from "./IntegerFormat";
import LengthFormat from "./LengthFormat";
import FloatFormat from "./FloatFormat";
import {computeComparableStatistics} from '../../domain/comparableStatistics';
import {comparableSaleView} from '../../domain/comparableSales';

type ComparableSale = Record<string, unknown>;

interface ComparableSalesStatisticsProps {
    comparableSales?: ComparableSale[];
    stats: string[];
    title?: string;
}

interface StatisticConfiguration {
    rangeTitle: string;
    averageTitle: string;
    render(value: number): React.ReactNode;
}

function ComparableSalesStatistics(props: ComparableSalesStatisticsProps)
{
    if (!props.comparableSales)
    {
        return null;
    }

    // Statistics are read-only. Materializing the legacy getters here keeps
    // their values available to both proxy-backed and future plain drafts.
    const comparableSales = props.comparableSales.map(comparableSaleView);

    const statConfigurations: Record<string, StatisticConfiguration> = {
            sizeSquareFootage: {
                rangeTitle: "Building Size Range (sqft)",
                averageTitle: "Building Size Average (sqft)",
                render: (value) => <IntegerFormat value={value}/>
            },
            pricePerSquareFoot: {
                rangeTitle: "Price Per Square Foot Range ($)",
                averageTitle: "Price Per Square Foot Average ($)",
                render: (value) => <CurrencyFormat value={value}/>
            },
            capitalizationRate: {
                rangeTitle: "Cap Rate Range (%)",
                averageTitle: "Cap Rate Average (%)",
                render: (value) => <PercentFormat value={value}/>
            },
            displayCapitalizationRate: {
                rangeTitle: "Cap Rate Range (%)",
                averageTitle: "Cap Rate Average (%)",
                render: (value) => <PercentFormat value={value}/>
            },
            clearCeilingHeight: {
                rangeTitle: "Clear Ceiling Height Range (%)",
                averageTitle: "Clear Ceiling Height Average (%)",
                render: (value) => <LengthFormat value={value}/>
            },
            sizeOfLandAcres: {
                rangeTitle: "Size of Land Range (acres)",
                averageTitle: "Size of Land Average (acres)",
                render: (value) => <IntegerFormat value={value}/>
            },
            sizeOfLandSqft: {
                rangeTitle: "Size of Land Range (sqft)",
                averageTitle: "Size of Land Average (sqft)",
                render: (value) => <IntegerFormat value={value}/>
            },
            sizeOfBuildableAreaSqft: {
                rangeTitle: "Size of Buildable Area Range (sqft)",
                averageTitle: "Size of Buildable Area Average (sqft)",
                render: (value) => <IntegerFormat value={value}/>
            },
            buildableUnits: {
                rangeTitle: "Buildable Units Range",
                averageTitle: "Buildable Units Average",
                render: (value) => <IntegerFormat value={value}/>
            },
            floorSpaceIndex: {
                rangeTitle: "Floor Space Index Range",
                averageTitle: "Floor Space Index Average",
                render: (value) => <FloatFormat value={value}/>
            },
            pricePerSquareFootLand: {
                rangeTitle: "PSF of Land Range ($)",
                averageTitle: "PSF of Land Average ($)",
                render: (value) => <CurrencyFormat value={value}/>
            },
            pricePerAcreLand: {
                rangeTitle: "PPA of Land Range ($)",
                averageTitle: "PPA of Land Average ($)",
                render: (value) => <CurrencyFormat value={value} cents={false}/>
            },
            pricePerSquareFootBuildableArea: {
                rangeTitle: "PSF Buildable Range ($)",
                averageTitle: "PSF Buildable Average ($)",
                render: (value) => <CurrencyFormat value={value} cents={false}/>
            },
            pricePerBuildableUnit: {
                rangeTitle: "Buildable Unit Price Range ($)",
                averageTitle: "Buildable Unit Price Average ($)",
                render: (value) => <CurrencyFormat value={value} cents={false}/>
            },
            noiPSFMultiple: {
                rangeTitle: "Multiple Range",
                averageTitle: "Multiple Average",
                render: (value) => <FloatFormat value={value}/>
            },
            displayNOIPSFMultiple: {
                rangeTitle: "Multiple Range",
                averageTitle: "Multiple Average",
                render: (value) => <FloatFormat value={value}/>
            },
            netOperatingIncomePSF: {
                rangeTitle: "NOI PSF Range ($)",
                averageTitle: "NOI PSF Average ($)",
                render: (value) => <CurrencyFormat value={value} cents={false}/>
            },
            displayNetOperatingIncomePSF: {
                rangeTitle: "NOI PSF Range ($)",
                averageTitle: "NOI PSF Average ($)",
                render: (value) => <CurrencyFormat value={value} cents={false}/>
            },
            salePrice: {
                rangeTitle: "Sale Price Range ($)",
                averageTitle: "Sale Price Average ($)",
                render: (value) => <CurrencyFormat value={value} cents={false}/>
            },
            netOperatingIncome: {
                rangeTitle: "NOI Range ($)",
                averageTitle: "NOI Average ($)",
                render: (value) => <CurrencyFormat value={value} cents={false}/>
            },
            displayNetOperatingIncome: {
                rangeTitle: "NOI Range ($)",
                averageTitle: "NOI Average ($)",
                render: (value) => <CurrencyFormat value={value} cents={false}/>
            },
            pricePerUnit: {
                rangeTitle: "Price / Unit Range ($)",
                averageTitle: "Price / Unit Average ($)",
                render: (value) => <CurrencyFormat value={value} cents={false}/>
            },
            occupancyRate: {
                rangeTitle: "Occupancy Rate Range (%)",
                averageTitle: "Occupancy Rate Average (%)",
                render: (value) => <PercentFormat value={value}/>
            },
            noiPerUnit: {
                rangeTitle: "NOI / Unit Range ($)",
                averageTitle: "NOI / Unit Average ($)",
                render: (value) => <CurrencyFormat value={value} cents={false}/>
            },
            displayNOIPerUnit: {
                rangeTitle: "NOI / Unit Range ($)",
                averageTitle: "NOI / Unit Average ($)",
                render: (value) => <CurrencyFormat value={value} cents={false}/>
            },
            pricePerBedroom: {
                rangeTitle: "Price / Bedroom Range ($)",
                averageTitle: "Price / Bedroom Average ($)",
                render: (value) => <CurrencyFormat value={value} cents={false}/>
            }
        };

    const statFields: Array<string | null> = [...props.stats];
        while(statFields.length % 2 !== 0)
        {
            statFields.push(null);
        }

        return (
            <Row className={"comparable-sales-statistics"}>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>
                            {
                                props.title ?
                                    <Row>
                                        <Col xs={12}>
                                            <h4>{props.title}</h4>
                                        </Col>
                                    </Row> : null
                            }
                            <Row className={"statRow"}>
                                {
                                    statFields.map((statField, statIndex) =>
                                    {
                                        if (statField === null)
                                        {
                                            return <Col key={`empty-${statIndex}`} className={"statColumn"} />;
                                        }

                                        const stats = computeComparableStatistics(comparableSales, statField);
                                        const render = statConfigurations[statField].render;

                                        return <Col className={"statColumn"} key={statIndex}>
                                            <div className={"statBlock"}>
                                                <strong>{statConfigurations[statField].rangeTitle}:</strong>&nbsp;&nbsp;&nbsp;
                                            </div>
                                            <div className={"statBlock"}>
                                                {
                                                    stats.min ? <span>{render(stats.min)} - {render(stats.max!)}</span> : <span>n/a</span>
                                                }
                                            </div>
                                            <br/>
                                            <div className={"statBlock"}>
                                                <strong>{statConfigurations[statField].averageTitle}:</strong>&nbsp;&nbsp;&nbsp;
                                            </div>
                                            <div className={"statBlock"}>
                                                {
                                                    stats.average ? <span>{render(stats.average)}</span> : <span>n/a</span>
                                                }
                                            </div>
                                        </Col>
                                    })
                                }
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        );
}


export default ComparableSalesStatistics;

import React from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import _ from 'underscore';
import CurrencyFormat from "./CurrencyFormat";
import PercentFormat from "./PercentFormat";
import IntegerFormat from "./IntegerFormat";
import LengthFormat from "./LengthFormat";
import FloatFormat from "./FloatFormat";
import AreaFormat from "./AreaFormat";

class ComparableSalesStatistics extends React.Component
{
    state = {};

    computeStatsForField(field)
    {
        let minVal = null;
        let maxVal = null;
        let totalVal = 0;
        let valCount = 0;

        this.props.comparableSales.forEach((comparable) =>
        {
            if (_.isNumber(comparable[field]))
            {
                if (minVal === null || comparable[field] < minVal)
                {
                    minVal = comparable[field];
                }

                if (maxVal === null || comparable[field] > maxVal)
                {
                    maxVal = comparable[field];
                }

                totalVal += comparable[field];
                valCount += 1;
            }
        });

        return {
            min: minVal,
            max: maxVal,
            average: valCount > 0 ? totalVal / valCount : 0,
        }
    }

    render()
    {
        if (!this.props.comparableSales)
        {
            return null;
        }

        const statConfigurations = {
            sizeSquareFootage: {
                rangeTitle: "Building Size Range ($)",
                averageTitle: "Building Size Average ($)",
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
                rangeTitle: "Multiple Range ($)",
                averageTitle: "Multiple Average ($)",
                render: (value) => <FloatFormat value={value} cents={false}/>
            },
            netOperatingIncomePSF: {
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
            }
        };

        const statFields = _.clone(this.props.stats);
        statFields.forEach((field) =>
        {
            if (!statConfigurations[field])
            {
                const message = `Error! No statistic configuration for ${field}`;
                console.error(message);

                if (process.env.VALUATE_ENVIRONMENT.REACT_APP_DEBUG)
                {
                    alert(message);
                }
            }
        });

        while(statFields.length % 3 !== 0)
        {
            statFields.push(null);
        }

        return (
            <Row className={"comparable-sales-statistics"}>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>
                            {
                                this.props.title ?
                                    <Row>
                                        <Col xs={12}>
                                            <h4>{this.props.title}</h4>
                                        </Col>
                                    </Row> : null
                            }
                            <Row className={"statRow"}>
                                {
                                    statFields.map((statField, statIndex) =>
                                    {
                                        if (statField === null)
                                        {
                                            return <Col className={"statColumn"} />;
                                        }

                                        const stats = this.computeStatsForField(statField);
                                        const render = statConfigurations[statField].render;

                                        return <Col className={"statColumn"} key={statIndex}>
                                            <div className={"statBlock"}>
                                                <strong>{statConfigurations[statField].rangeTitle}:</strong>&nbsp;&nbsp;&nbsp;
                                            </div>
                                            <div className={"statBlock"}>
                                                {
                                                    stats.min ? <span>{render(stats.min)} - {render(stats.max)}</span> : <span>n/a</span>
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
}


export default ComparableSalesStatistics;


import React from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import _ from 'underscore';
import CurrencyFormat from "./CurrencyFormat";
import PercentFormat from "./PercentFormat";
import IntegerFormat from "./IntegerFormat";
import LengthFormat from "./LengthFormat";

class ComparableSalesStatistics extends React.Component
{
    state = {
        
    };

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

    computeStatistics()
    {
        let {min: minSize, max: maxSize, average: sizeAverage} = this.computeStatsForField('sizeSquareFootage');
        let {min: minPPS, max: maxPPS,  average: averagePPS} = this.computeStatsForField('pricePerSquareFoot');
        let {min: minCapRate, max: maxCapRate,  average: averageCapRate} = this.computeStatsForField('capitalizationRate');
        let {min: minClearCeilingHeight, max: maxClearCeilingHeight,  average: averageClearCeilingHeight} = this.computeStatsForField('clearCeilingHeight');

        let {min: minSizeOfLand, max: maxSizeOfLand,  average: averageSizeOfLand} = this.computeStatsForField('sizeOfLandAcres');

        let {min: minFSI, max: maxFSI,  average: averageFSI} = this.computeStatsForField('floorSpaceIndex');
        let {min: minPPSLand, max: maxPPSLand,  average: averagePPSLand} = this.computeStatsForField('pricePerSquareFootLand');

        let {min: minPricePerAcreLand, max: maxPricePerAcreLand,  average: averagePricePerAcreLand} = this.computeStatsForField('pricePerAcreLand');

        let {min: minPPSBuildableArea, max: maxPPSBuildableArea,  average: averagePPSBuildableArea} = this.computeStatsForField('pricePerSquareFootBuildableArea');

        return {
            minSize,
            maxSize,
            sizeAverage,
            minCapRate,
            maxCapRate,
            averageCapRate,
            minPPS,
            maxPPS,
            averagePPS,
            minClearCeilingHeight,
            maxClearCeilingHeight,
            averageClearCeilingHeight,
            minSizeOfLand,
            maxSizeOfLand,
            averageSizeOfLand,
            minFSI,
            maxFSI,
            averageFSI,
            minPPSLand,
            maxPPSLand,
            averagePPSLand,
            minPricePerAcreLand,
            maxPricePerAcreLand,
            averagePricePerAcreLand,
            minPPSBuildableArea,
            maxPPSBuildableArea,
            averagePPSBuildableArea
        }
    }

    render()
    {
        if (!this.props.comparableSales)
        {
            return null;
        }

        const stats = this.computeStatistics();

        return (
            <Row className={"comparable-sales-statistics"}>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>
                            <Row>
                                <Col xs={12}>
                                    <h4>{this.props.title}</h4>
                                </Col>
                            </Row>
                            {
                                this.props.appraisal.propertyType !== 'land' ?
                                    <Row>
                                        <Col xs={4}>
                                            <strong>Cap Rate Range (%)</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.minCapRate ? <span>
                                            <PercentFormat value={stats.minCapRate} /> - <PercentFormat value={stats.maxCapRate}/></span> : null
                                            }
                                        </Col>
                                        <Col xs={4}>
                                            <strong>Price Per Square Foot Range ($)</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.minPPS ? <span><CurrencyFormat value={stats.minPPS} cents={false} /> - <CurrencyFormat value={stats.maxPPS} cents={false} /></span> : null
                                            }
                                        </Col>
                                        <Col xs={4}>
                                            <strong>Building Size Range (sq)</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.minSize ? <span><IntegerFormat value={stats.minSize} /> - <IntegerFormat value={stats.maxSize} /></span> : null
                                            }
                                        </Col>
                                    </Row> : null
                            }
                            {
                                this.props.appraisal.propertyType !== 'land' ?
                                    <Row>
                                        <Col xs={4}>
                                            <strong>Cap Rate Average (%)</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.averageCapRate ? <PercentFormat value={stats.averageCapRate}/> : null
                                            }
                                        </Col>
                                        <Col xs={4}>
                                            <strong>Price Per Square Average ($)</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.averagePPS ? <CurrencyFormat value={stats.averagePPS} cents={false}/> : null
                                            }
                                        </Col>
                                        <Col xs={4}>
                                            <strong>Building Size Average (sq)</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.sizeAverage ? <IntegerFormat value={stats.sizeAverage}/> : null
                                            }
                                        </Col>
                                    </Row> : null
                            }
                            {
                                this.props.appraisal.propertyType === 'industrial' ?
                                    <Row>
                                        <Col xs={4}>
                                            <strong>Clear Ceiling Height Range</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.minClearCeilingHeight ? <span><IntegerFormat value={stats.minClearCeilingHeight} /> - <LengthFormat value={stats.maxClearCeilingHeight} /></span> : null
                                            }
                                        </Col>
                                    </Row> : null
                            }
                            {
                                this.props.appraisal.propertyType === 'industrial' ?
                                    <Row>
                                        <Col xs={4}>
                                            <strong>Clear Ceiling Height Average</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.averageClearCeilingHeight ? <LengthFormat value={stats.averageClearCeilingHeight} /> : null
                                            }
                                        </Col>
                                    </Row> : null
                            }
                            {
                                this.props.appraisal.propertyType === 'land' ?
                                    <Row>
                                        <Col xs={4}>
                                            <strong>Size of Land  (acres) Range </strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.minSizeOfLand ? <span>
                                            <IntegerFormat value={stats.minSizeOfLand} /> - <IntegerFormat value={stats.maxSizeOfLand}/></span> : null
                                            }
                                        </Col>
                                        <Col xs={4}>
                                            <strong>Floor Space Index Range</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.minFSI ? <span>{stats.minFSI.toFixed(2)} - {stats.maxFSI.toFixed(2)}</span> : null
                                            }
                                        </Col>
                                        <Col xs={4}>
                                            <strong>PPS of Land ($)</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.minPPSLand ? <span><CurrencyFormat value={stats.minPPSLand} /> - <CurrencyFormat value={stats.maxPPSLand} /></span> : null
                                            }
                                        </Col>
                                    </Row> : null
                            }
                            {
                                this.props.appraisal.propertyType === 'land' ?
                                    <Row>
                                        <Col xs={4}>
                                            <strong>Size of Land (acres) Average </strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.averageSizeOfLand ? <span><IntegerFormat value={stats.averageSizeOfLand} /></span> : null
                                            }
                                        </Col>
                                        <Col xs={4}>
                                            <strong>Floor Space Index Average</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.averageFSI ? <span>{stats.averageFSI}</span> : null
                                            }
                                        </Col>
                                        <Col xs={4}>
                                            <strong>PPS of Land ($)</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.averagePPSLand ? <span><CurrencyFormat value={stats.averagePPSLand} /></span> : null
                                            }
                                        </Col>
                                    </Row> : null
                            }
                            {
                                this.props.appraisal.propertyType === 'land' ?
                                    <Row>
                                        <Col xs={4}>
                                            <strong>PPS of Buildable Area Range ($/sqft) </strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.minPPSBuildableArea ? <span>
                                            <CurrencyFormat value={stats.minPPSBuildableArea} /> - <CurrencyFormat value={stats.maxPPSBuildableArea}/></span> : null
                                            }
                                        </Col>
                                        <Col xs={4}>
                                            <strong>Price per Acre Land Range ($)</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.minPricePerAcreLand ? <span><CurrencyFormat value={stats.minPricePerAcreLand} cents={false} /> - <CurrencyFormat value={stats.maxPricePerAcreLand} cents={false} /></span> : null
                                            }
                                        </Col>
                                    </Row> : null
                            }
                            {
                                this.props.appraisal.propertyType === 'land' ?
                                    <Row>
                                        <Col xs={4}>
                                            <strong>PPS of Buildable Area Average ($/sqft) </strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.averagePPSBuildableArea ? <span><CurrencyFormat value={stats.averagePPSBuildableArea}/></span> : null
                                            }
                                        </Col>
                                        <Col xs={4}>
                                            <strong>Price per Acre Land Average ($)</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.averagePricePerAcreLand ? <span><CurrencyFormat value={stats.averagePricePerAcreLand} cents={false} /></span> : null
                                            }
                                        </Col>
                                    </Row> : null
                            }
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        );
    }
}


export default ComparableSalesStatistics;


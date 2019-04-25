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
        let {min: minPSF, max: maxPSF,  average: averagePSF} = this.computeStatsForField('pricePerSquareFoot');
        let {min: minCapRate, max: maxCapRate,  average: averageCapRate} = this.computeStatsForField('capitalizationRate');
        let {min: minClearCeilingHeight, max: maxClearCeilingHeight,  average: averageClearCeilingHeight} = this.computeStatsForField('clearCeilingHeight');

        let {min: minSizeOfLand, max: maxSizeOfLand,  average: averageSizeOfLand} = this.computeStatsForField('sizeOfLandAcres');

        let {min: minFSI, max: maxFSI,  average: averageFSI} = this.computeStatsForField('floorSpaceIndex');
        let {min: minPSFLand, max: maxPSFLand,  average: averagePSFLand} = this.computeStatsForField('pricePerSquareFootLand');

        let {min: minPricePerAcreLand, max: maxPricePerAcreLand,  average: averagePricePerAcreLand} = this.computeStatsForField('pricePerAcreLand');

        let {min: minPSFBuildableArea, max: maxPSFBuildableArea,  average: averagePSFBuildableArea} = this.computeStatsForField('pricePerSquareFootBuildableArea');

        return {
            minSize,
            maxSize,
            sizeAverage,
            minCapRate,
            maxCapRate,
            averageCapRate,
            minPSF,
            maxPSF,
            averagePSF,
            minClearCeilingHeight,
            maxClearCeilingHeight,
            averageClearCeilingHeight,
            minSizeOfLand,
            maxSizeOfLand,
            averageSizeOfLand,
            minFSI,
            maxFSI,
            averageFSI,
            minPSFLand,
            maxPSFLand,
            averagePSFLand,
            minPricePerAcreLand,
            maxPricePerAcreLand,
            averagePricePerAcreLand,
            minPSFBuildableArea,
            maxPSFBuildableArea,
            averagePSFBuildableArea
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
                                            <PercentFormat value={stats.minCapRate} /> - <PercentFormat value={stats.maxCapRate}/></span> : <span>n/a</span>
                                            }
                                        </Col>
                                        <Col xs={4}>
                                            <strong>Price Per Square Foot Range ($)</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.minPSF ? <span><CurrencyFormat value={stats.minPSF} cents={false} /> - <CurrencyFormat value={stats.maxPSF} cents={false} /></span> : <span>n/a</span>
                                            }
                                        </Col>
                                        <Col xs={4}>
                                            <strong>Building Size Range (sq)</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.minSize ? <span><IntegerFormat value={stats.minSize} /> - <IntegerFormat value={stats.maxSize} /></span> : <span>n/a</span>
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
                                                stats.averageCapRate ? <PercentFormat value={stats.averageCapRate}/> : <span>n/a</span>
                                            }
                                        </Col>
                                        <Col xs={4}>
                                            <strong>Price Per Square Average ($)</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.averagePSF ? <CurrencyFormat value={stats.averagePSF} cents={false}/> : <span>n/a</span>
                                            }
                                        </Col>
                                        <Col xs={4}>
                                            <strong>Building Size Average (sq)</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.sizeAverage ? <IntegerFormat value={stats.sizeAverage}/> : <span>n/a</span>
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
                                                stats.minClearCeilingHeight ? <span><IntegerFormat value={stats.minClearCeilingHeight} /> - <LengthFormat value={stats.maxClearCeilingHeight} /></span> : <span>n/a</span>
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
                                                stats.averageClearCeilingHeight ? <LengthFormat value={stats.averageClearCeilingHeight} /> : <span>n/a</span>
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
                                            <IntegerFormat value={stats.minSizeOfLand} /> - <IntegerFormat value={stats.maxSizeOfLand}/></span> : <span>n/a</span>
                                            }
                                        </Col>
                                        <Col xs={4}>
                                            <strong>Floor Space Index Range</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.minFSI ? <span>{stats.minFSI.toFixed(2)} - {stats.maxFSI.toFixed(2)}</span> : <span>n/a</span>
                                            }
                                        </Col>
                                        <Col xs={4}>
                                            <strong>PSF of Land ($)</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.minPSFLand ? <span><CurrencyFormat value={stats.minPSFLand} /> - <CurrencyFormat value={stats.maxPSFLand} /></span> : <span>n/a</span>
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
                                                stats.averageSizeOfLand ? <span><IntegerFormat value={stats.averageSizeOfLand} /></span> : <span>n/a</span>
                                            }
                                        </Col>
                                        <Col xs={4}>
                                            <strong>Floor Space Index Average</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.averageFSI ? <span>{stats.averageFSI}</span> : <span>n/a</span>
                                            }
                                        </Col>
                                        <Col xs={4}>
                                            <strong>PSF of Land ($)</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.averagePSFLand ? <span><CurrencyFormat value={stats.averagePSFLand} /></span> : <span>n/a</span>
                                            }
                                        </Col>
                                    </Row> : null
                            }
                            {
                                this.props.appraisal.propertyType === 'land' ?
                                    <Row>
                                        <Col xs={4}>
                                            <strong>PSF of Buildable Area Range ($/sqft) </strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.minPSFBuildableArea ? <span>
                                            <CurrencyFormat value={stats.minPSFBuildableArea} /> - <CurrencyFormat value={stats.maxPSFBuildableArea}/></span> : <span>n/a</span>
                                            }
                                        </Col>
                                        <Col xs={4}>
                                            <strong>Price per Acre Land Range ($)</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.minPricePerAcreLand ? <span><CurrencyFormat value={stats.minPricePerAcreLand} cents={false} /> - <CurrencyFormat value={stats.maxPricePerAcreLand} cents={false} /></span> : <span>n/a</span>
                                            }
                                        </Col>
                                    </Row> : null
                            }
                            {
                                this.props.appraisal.propertyType === 'land' ?
                                    <Row>
                                        <Col xs={4}>
                                            <strong>PSF of Buildable Area Average ($/sqft) </strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.averagePSFBuildableArea ? <span><CurrencyFormat value={stats.averagePSFBuildableArea}/></span> : <span>n/a</span>
                                            }
                                        </Col>
                                        <Col xs={4}>
                                            <strong>Price per Acre Land Average ($)</strong>&nbsp;&nbsp;&nbsp;
                                            {
                                                stats.averagePricePerAcreLand ? <span><CurrencyFormat value={stats.averagePricePerAcreLand} cents={false} /></span> : <span>n/a</span>
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


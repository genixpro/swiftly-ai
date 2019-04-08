import React from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import _ from 'underscore';
import CurrencyFormat from "./CurrencyFormat";
import PercentFormat from "./PercentFormat";
import IntegerFormat from "./IntegerFormat";

class ComparableSalesStatistics extends React.Component
{
    state = {
        
    };

    computeStatistics()
    {
        let minSize = null;
        let maxSize = null;
        let totalSize = 0;
        let sizeCount = 0;

        let minCapRate = null;
        let maxCapRate = null;
        let totalCapRate = 0;
        let capCount = 0;

        let minPPS = null;
        let maxPPS = null;
        let totalPPS = 0;
        let ppsCount = 0;

        this.props.comparableSales.forEach((comparable) =>
        {
            if (_.isNumber(comparable.capitalizationRate))
            {
                if (minCapRate === null || comparable.capitalizationRate < minCapRate)
                {
                    minCapRate = comparable.capitalizationRate;
                }

                if (maxCapRate === null || comparable.capitalizationRate > maxCapRate)
                {
                    maxCapRate = comparable.capitalizationRate;
                }

                totalCapRate += comparable.capitalizationRate;
                capCount += 1;
            }

            if (_.isNumber(comparable.sizeSquareFootage))
            {
                if (minSize === null || comparable.sizeSquareFootage < minSize)
                {
                    minSize = comparable.sizeSquareFootage;
                }

                if (maxSize === null || comparable.sizeSquareFootage > maxSize)
                {
                    maxSize = comparable.sizeSquareFootage;
                }

                totalSize += comparable.sizeSquareFootage;
                sizeCount += 1;
            }

            if (_.isNumber(comparable.pricePerSquareFoot))
            {
                if (minPPS === null || comparable.pricePerSquareFoot < minPPS)
                {
                    minPPS = comparable.pricePerSquareFoot;
                }

                if (maxPPS === null || comparable.pricePerSquareFoot > maxPPS)
                {
                    maxPPS = comparable.pricePerSquareFoot;
                }

                totalPPS += comparable.pricePerSquareFoot;
                ppsCount += 1;
            }
        });

        return {
            minSize,
            maxSize,
            sizeAverage: sizeCount > 0 ? totalSize / sizeCount : 0,
            minCapRate,
            maxCapRate,
            averageCapRate: capCount > 0 ? totalCapRate / capCount : 0,
            minPPS,
            maxPPS,
            averagePPS: ppsCount > 0 ? totalPPS / ppsCount : 0
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
                            </Row>
                            <Row>
                                <Col xs={4}>
                                    <strong>Cap Rate Average (%)</strong>&nbsp;&nbsp;&nbsp;
                                    {
                                        stats.averageCapRate ? <PercentFormat value={stats.averageCapRate} /> : null
                                    }
                                </Col>
                                <Col xs={4}>
                                    <strong>Price Per Square Average ($)</strong>&nbsp;&nbsp;&nbsp;
                                    {
                                        stats.averagePPS ? <CurrencyFormat value={stats.averagePPS} cents={false} /> : null
                                    }
                                </Col>
                                <Col xs={4}>
                                    <strong>Building Size Average (sq)</strong>&nbsp;&nbsp;&nbsp;
                                    {
                                        stats.sizeAverage ? <IntegerFormat value={stats.sizeAverage} /> : null
                                    }
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        );
    }
}


export default ComparableSalesStatistics;


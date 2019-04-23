import React from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import _ from 'underscore';
import CurrencyFormat from "./CurrencyFormat";
import AreaFormat from "./AreaFormat";

class ComparableLeasesStatistics extends React.Component
{
    state = {

    };

    computeStatistics()
    {
        let minSize = null;
        let maxSize = null;
        let totalSize = 0;
        let sizeCount = 0;

        let minRent = null;
        let maxRent = null;
        let totalRent = 0;
        let rentCount = 0;

        let minTMI = null;
        let maxTMI = null;
        let totalTMI = 0;
        let tmiCount = 0;

        this.props.comparableLeases.forEach((comparable) =>
        {
            if (_.isNumber(comparable.sizeOfUnit))
            {
                if (minSize === null || comparable.sizeOfUnit < minSize)
                {
                    minSize = comparable.sizeOfUnit;
                }

                if (maxSize === null || comparable.sizeOfUnit > maxSize)
                {
                    maxSize = comparable.sizeOfUnit;
                }

                totalSize += comparable.sizeOfUnit;
                sizeCount += 1;
            }

            if (_.isNumber(comparable.startingYearlyRent))
            {
                if (minRent === null || comparable.startingYearlyRent < minRent)
                {
                    minRent = comparable.startingYearlyRent;
                }

                if (maxRent === null || comparable.startingYearlyRent > maxRent)
                {
                    maxRent = comparable.startingYearlyRent;
                }

                totalRent += comparable.startingYearlyRent;
                rentCount += 1;
            }

            if (_.isNumber(comparable.taxesMaintenanceInsurance))
            {
                if (minTMI === null || comparable.taxesMaintenanceInsurance < minTMI)
                {
                    minTMI = comparable.taxesMaintenanceInsurance;
                }

                if (maxTMI === null || comparable.taxesMaintenanceInsurance > maxTMI)
                {
                    maxTMI = comparable.taxesMaintenanceInsurance;
                }

                totalTMI += comparable.taxesMaintenanceInsurance;
                tmiCount += 1;
            }
        });

        return {
            minSize,
            maxSize,
            averageSize: sizeCount > 0 ? totalSize / sizeCount : null,
            minRent,
            maxRent,
            averageRent: totalRent > 0 ? totalRent / rentCount : null,
            minTMI,
            maxTMI,
            averageTMI: totalTMI > 0 ? totalTMI / tmiCount : null
        }
    }

    render()
    {
        if (!this.props.comparableLeases)
        {
            return null;
        }

        const stats = this.computeStatistics();

        return (
            <Row className={"comparable-leases-statistics"}>
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
                                    <strong>Size Range</strong>&nbsp;&nbsp;&nbsp;
                                    {
                                        stats.minSize ? <span><AreaFormat value={stats.minSize} /> - <AreaFormat value={stats.maxSize} /></span> : <span>n/a</span>
                                    }
                                </Col>
                                <Col xs={4}>
                                    <strong>Yearly Rent Range</strong>&nbsp;&nbsp;&nbsp;
                                    {
                                        stats.minRent ? <span><CurrencyFormat value={stats.minRent} /> - <CurrencyFormat value={stats.maxRent} /></span> : <span>n/a</span>
                                    }
                                </Col>
                                <Col xs={4}>
                                    <strong>TMI Range</strong>&nbsp;&nbsp;&nbsp;
                                    {
                                        stats.minTMI ? <span><CurrencyFormat value={stats.minTMI} /> - <CurrencyFormat value={stats.maxTMI} /></span> : <span>n/a</span>
                                    }
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={4}>
                                    <strong>Size Average</strong>&nbsp;&nbsp;&nbsp;
                                    {
                                        stats.averageSize ? <span><AreaFormat value={stats.averageSize} /></span> : <span>n/a</span>
                                    }
                                </Col>
                                <Col xs={4}>
                                    <strong>Yearly Rent Average</strong>&nbsp;&nbsp;&nbsp;
                                    {
                                        stats.averageRent ? <span><CurrencyFormat value={stats.averageRent} /></span> : <span>n/a</span>
                                    }
                                </Col>
                                <Col xs={4}>
                                    <strong>TMI Average</strong>&nbsp;&nbsp;&nbsp;
                                    {
                                        stats.averageTMI ? <span><CurrencyFormat value={stats.averageTMI} /></span> : <span>n/a</span>
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


export default ComparableLeasesStatistics;


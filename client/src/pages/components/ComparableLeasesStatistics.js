import React from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import _ from 'underscore';
import CurrencyFormat from "./CurrencyFormat";
import AreaFormat from "./AreaFormat";

class ComparableLeasesStatistics extends React.Component
{
    state = {

    };

    computeStatsForField(field)
    {
        let minVal = null;
        let maxVal = null;
        let totalVal = 0;
        let valCount = 0;

        this.props.comparableLeases.forEach((comparable) =>
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
        if (!this.props.comparableLeases)
        {
            return null;
        }

        const statConfigurations = {
            sizeOfUnit: {
                rangeTitle: "Size Range (sqft))",
                averageTitle: "Size Average (sqft)",
                render: (value) => <AreaFormat value={value}/>
            },
            startingYearlyRent: {
                rangeTitle: "Yearly Rent Range ($)",
                averageTitle: "Yearly Rent Average ($)",
                render: (value) => <CurrencyFormat value={value}/>
            },
            taxesMaintenanceInsurance: {
                rangeTitle: "TMI Range ($)",
                averageTitle: "TMI Average (%)",
                render: (value) => <CurrencyFormat value={value}/>
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
            <Row className={"comparable-leases-statistics"}>
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


export default ComparableLeasesStatistics;


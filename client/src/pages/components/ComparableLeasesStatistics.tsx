import React from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import CurrencyFormat from "./CurrencyFormat";
import AreaFormat from "./AreaFormat";
import {computeComparableStatistics} from '../../domain/comparableStatistics';
import {comparableLeaseView} from '../../domain/comparableLeases';

type ComparableLease = Record<string, unknown>;

interface ComparableLeasesStatisticsProps {
    comparableLeases?: ComparableLease[];
    stats: string[];
    title?: string;
}

interface StatisticConfiguration {
    rangeTitle: string;
    averageTitle: string;
    render(value: number): React.ReactNode;
}

function ComparableLeasesStatistics(props: ComparableLeasesStatisticsProps)
{
    if (!props.comparableLeases)
    {
        return null;
    }

    const comparableLeases = props.comparableLeases.map(comparableLeaseView);
    const statConfigurations: Record<string, StatisticConfiguration> = {
            sizeOfUnit: {
                rangeTitle: "Size Range (sqft)",
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
                averageTitle: "TMI Average ($)",
                render: (value) => <CurrencyFormat value={value}/>
            }
        };

    const statFields: Array<string | null> = [...props.stats];
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

                                        const stats = computeComparableStatistics(comparableLeases, statField);
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


export default ComparableLeasesStatistics;

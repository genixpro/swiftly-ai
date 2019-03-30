import React from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
import Datetime from 'react-datetime';
import PropertyTypeSelector from './PropertyTypeSelector';
import _ from 'underscore';

class ComparableLeasesStatistics extends React.Component
{
    state = {

    };

    computeStatistics()
    {
        let minSize = null;
        let maxSize = null;

        let minRent = null;
        let maxRent = null;

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
            }

            if (_.isNumber(comparable.yearlyRent))
            {
                if (minRent === null || comparable.yearlyRent < minRent)
                {
                    minRent = comparable.yearlyRent;
                }

                if (maxRent === null || comparable.yearlyRent > maxRent)
                {
                    maxRent = comparable.yearlyRent;
                }
            }
        });

        return {minSize, maxSize, minRent, maxRent}
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
                                <Col xs={4}>
                                    <strong>Size Range</strong>&nbsp;&nbsp;&nbsp;
                                    {
                                        stats.minSize ? <span>{stats.minSize} - {stats.maxSize}</span> : null
                                    }
                                </Col>
                                <Col xs={4}>
                                    <strong>Yearly Rent Range</strong>&nbsp;&nbsp;&nbsp;
                                    {
                                        stats.minRent ? <span>{stats.minRent} - {stats.maxRent}</span> : null
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


import React from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
import Datetime from 'react-datetime';
import PropertyTypeSelector from './PropertyTypeSelector';
import _ from 'underscore';

class ComparableSalesStatistics extends React.Component
{
    state = {
        
    };

    computeStatistics()
    {
        let minTMI = null;
        let maxTMI = null;

        let minVacancy = null;
        let maxVacancy = null;

        let minCapRate = null;
        let maxCapRate = null;

        this.props.comparableSales.forEach((comparable) =>
        {
            if (_.isNumber(comparable.taxesMaintenanceInsurancePSF))
            {
                if (minTMI === null || comparable.taxesMaintenanceInsurancePSF < minTMI)
                {
                    minTMI = comparable.taxesMaintenanceInsurancePSF;
                }

                if (maxTMI === null || comparable.taxesMaintenanceInsurancePSF > maxTMI)
                {
                    maxTMI = comparable.taxesMaintenanceInsurancePSF;
                }
            }

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
            }

            if (_.isNumber(comparable.vacancyRate))
            {
                if (minVacancy === null || comparable.vacancyRate < minCapRate)
                {
                    minVacancy = comparable.vacancyRate;
                }

                if (maxVacancy === null || comparable.vacancyRate > maxCapRate)
                {
                    maxVacancy = comparable.vacancyRate;
                }
            }
        });

        return {minTMI, maxTMI, minVacancy, maxVacancy, minCapRate, maxCapRate}
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
                                <Col xs={4}>
                                    <strong>TMI Range</strong>&nbsp;&nbsp;&nbsp;
                                    {
                                        stats.minTMI ? <span>{stats.minTMI} - {stats.maxTMI}</span> : null
                                    }
                                </Col>
                                <Col xs={4}>
                                    <strong>Vacancy Range</strong>&nbsp;&nbsp;&nbsp;
                                    {
                                        stats.minVacancy ? <span>{stats.minVacancy} - {stats.maxVacancy}</span> : null
                                    }
                                </Col>
                                <Col xs={4}>
                                    <strong>Cap Rate Range</strong>&nbsp;&nbsp;&nbsp;
                                    {
                                        stats.minCapRate ? <span>{stats.minCapRate} - {stats.maxCapRate}</span> : null
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


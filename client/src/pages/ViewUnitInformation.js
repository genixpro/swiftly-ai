import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table } from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import _ from 'underscore';
import Moment from 'react-moment';


class ViewTenants extends React.Component
{
    state = {
        capitalizationRate: 8.4,
        expandedTenants: {},
        unit: {}
    };

    componentDidMount()
    {
        axios.get(`/appraisal/${this.props.match.params.id}`).then((response) =>
        {
            this.setState({appraisal: response.data.appraisal});
            this.getUnitInformation(response.data.appraisal);
        });
    }

    getUnitInformation(appraisal)
    {
        appraisal.units.forEach((unit) =>
        {
            if (unit.unitNumber === this.props.match.params.unitNum)
            {
                this.setState({unit: unit});
            }
        });
    }

    render() {
        return (
            (this.state.appraisal) ?
                <div id={"view-tenants"} className={"view-tenants"}>
                    <Row>
                        <Col xs={12} md={12} lg={12} xl={12}>
                            <Card outline color="primary" className="mb-3">
                                <CardHeader className="text-white bg-primary">Tenants</CardHeader>
                                <CardBody>
                                    <p>Unit Number {this.state.unit.unitNumber}</p>
                                    <p>Floor Number {this.state.unit.floorNumber}</p>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>
                : null
        );
    }
}

export default ViewTenants;

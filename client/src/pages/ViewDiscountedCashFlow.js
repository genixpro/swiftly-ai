import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table } from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import _ from 'underscore';



class ViewDiscountedCashFlow extends React.Component
{
    state = {
        capitalizationRate: 8.4
    };

    componentDidMount()
    {
        axios.get(`/appraisal/${this.props.match.params.id}`).then((response) =>
        {
            this.setState({appraisal: response.data.appraisal}, () => this.groupCashFlowsByName())
        });
    }


    groupCashFlowsByName()
    {
        const grouped = _.groupBy(this.state.appraisal.cashFlows, (cashFlow) => cashFlow.name);

        this.setState({"rows": Object.values(grouped)});
    }




    componentDidUpdate()
    {

    }

    render() {
        return (
            (this.state.appraisal) ?
                <div id={"view-discounted-cash-flow"} className={"view-discounted-cash-flow"}>
                    <Row>
                        <Col xs={12} md={12} lg={12} xl={12}>
                            <Card outline color="primary" className="mb-3">
                                <CardHeader className="text-white bg-primary">Discounted Cash Flow</CardHeader>
                                <CardBody>
                                    <Table striped bordered hover responsive>
                                        <thead>
                                            <tr>
                                                <td>Name</td>
                                                {
                                                    this.state.rows && this.state.rows[0].map((cashFlow) => <td className={"amount-column"}>
                                                        <span><NumberFormat value={cashFlow['year']} displayType={"text"} /></span>
                                                    </td>)
                                                }
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            this.state.rows && this.state.rows.map((item, itemIndex) => {
                                                return <tr key={itemIndex}>
                                                    <td className={"name-column"}>
                                                        <span>{item[0].name}</span>
                                                    </td>
                                                        {
                                                            item.map((cashFlow) => <td className={"amount-column"}>
                                                                <span><NumberFormat value={cashFlow['amount']} displayType={"text"} decimalScale={2} /></span>
                                                            </td>)
                                                        }
                                                </tr>
                                            })
                                        }
                                        </tbody>
                                    </Table>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>
                : null
        );
    }
}

export default ViewDiscountedCashFlow;

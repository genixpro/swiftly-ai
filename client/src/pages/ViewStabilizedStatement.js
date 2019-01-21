import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table } from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";



class ViewStabilizedStatement extends React.Component
{
    state = {
        width: 0,
        height: 0
    };

    componentDidMount()
    {
        axios.get(`/appraisal/${this.props.match.params.id}`).then((response) =>
        {
            this.setState({appraisal: response.data.appraisal})
        });
    }

    componentDidUpdate()
    {

    }

    render() {
        return (
                this.state.appraisal ?
                    <div id={"view-stabilized-statement"} className={"view-stabilized-statement"}>
                        <Row>
                            <Col xs={12} md={10} lg={8} xl={6}>
                                <Card outline color="primary" className="mb-3">
                                    <CardHeader className="text-white bg-primary">Income</CardHeader>
                                    <CardBody>
                                        <Table striped bordered hover responsive>
                                            <thead>
                                            <tr>
                                                <th className={"name-column"}/>
                                                <th className={"amount-column"}/>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                this.state.appraisal.stabilizedStatement['income'] && this.state.appraisal.stabilizedStatement['income'].map((item) => {
                                                    return <tr key={item.lineNumber}>
                                                        <td className={"name-column"}>
                                                            <span>{item['income_name']}</span>
                                                        </td>
                                                        <td className={"amount-column"}>
                                                            <span>{item['income_amount']}</span>
                                                        </td>
                                                    </tr>
                                                })
                                            }
                                            <tr className={"total-row"}>
                                                <td className={"name-column"}>
                                                    <span>Total</span>
                                                </td>
                                                <td className={"amount-column"}>
                                                    <span>
                                                        <NumberFormat value={this.state.incomeTotal} displayType={'text'}
                                                                      thousandSeparator={', '}/>
                                                    </span>
                                                </td>
                                            </tr>

                                            </tbody>
                                        </Table>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} md={10} lg={8} xl={6}>
                                <Card outline color="primary" className="mb-3">
                                    <CardHeader className="text-white bg-primary">Expenses</CardHeader>
                                    <CardBody>
                                        <Table striped bordered hover responsive>
                                            <thead>
                                            <tr>
                                                <th className={"name-column"}/>
                                                <th className={"amount-column"}/>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                this.state.appraisal.stabilizedStatement['expense'] && this.state.appraisal.stabilizedStatement['expense'].map((item) => {
                                                    return <tr key={item.lineNumber}>
                                                        <td className={"name-column"}>
                                                            <span>{item['expense_name']}</span>
                                                        </td>
                                                        <td className={"amount-column"}>
                                                            <span>{item['expense_amount']}</span>
                                                        </td>
                                                    </tr>
                                                })
                                            }
                                            <tr className={"total-row"}>
                                                <td className={"name-column"}>
                                                    <span>Total</span>
                                                </td>
                                                <td className={"amount-column"}>
                                                    <span>
                                                        <NumberFormat value={this.state.expenseTotal}
                                                                      displayType={'text'}
                                                                      thousandSeparator={', '}/>
                                                    </span>
                                                </td>
                                            </tr>

                                            </tbody>
                                        </Table>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} md={10} lg={8} xl={6}>
                                <Card outline color="primary" className="mb-3">
                                    <CardHeader className="text-white bg-primary">Total</CardHeader>
                                    <CardBody>
                                        <Table striped bordered hover responsive>
                                            <tbody>
                                                <tr>
                                                    <td className={"name-column"}>
                                                        <span>Total Income</span>
                                                    </td>
                                                    <td className={"amount-column"}>
                                                            <span>
                                                                <NumberFormat value={this.state.incomeTotal}
                                                                              displayType={'text'}
                                                                              thousandSeparator={', '}/>
                                                            </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className={"name-column"}>
                                                        <span>Total Expenses</span>
                                                    </td>
                                                    <td className={"amount-column"}>
                                                            <span>
                                                                <NumberFormat value={this.state.expenseTotal}
                                                                              displayType={'text'}
                                                                              thousandSeparator={', '}/>
                                                            </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className={"name-column"}>
                                                        <span>Operating Income</span>
                                                    </td>
                                                    <td className={"amount-column"}>
                                                            <span>
                                                                <NumberFormat value={this.state.operatingIncome}
                                                                              displayType={'text'}
                                                                              thousandSeparator={', '}/>
                                                            </span>
                                                    </td>
                                                </tr>
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

export default ViewStabilizedStatement;

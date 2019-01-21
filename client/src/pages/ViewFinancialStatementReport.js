import React from 'react';
import { Row, Col, Card, CardHeader } from 'reactstrap';
import LeaseFields from "./LeaseFields";


class ViewFinancialStatementReport extends React.Component
{
    state = {
        width: 0,
        height: 0,
        financialStatement: {
            extractedData:{},
            words: []
        }
    };

    componentDidMount()
    {
        this.setState({"financialStatement": this.props.financialStatement});
    }

    componentDidUpdate()
    {


    }

    render() {
        return (
            <div id={"view-lease-report"}>
                <Row>
                    <Col xs={12} md={8}>
                        <Card outline color="primary" className="mb-3">
                            <CardHeader className="text-white bg-primary">Property Description</CardHeader>

                            <table>
                                <tbody>
                                {
                                    LeaseFields.map((group) =>
                                    {
                                        return group.fields.map((field) =>
                                                <tr className={"lease-report-row"} key={field.field}>
                                                    <td className={"lease-report-variable-name"}>{field.name}</td>
                                                    <td>{this.state.financialStatement.extractedData[field.field]}</td>
                                                </tr>)
                                    })
                                }
                                </tbody>
                            </table>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ViewFinancialStatementReport;

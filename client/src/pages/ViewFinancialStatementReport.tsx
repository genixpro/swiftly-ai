import React, {type ReactNode} from 'react';
import { Row, Col, Card, CardHeader } from 'reactstrap';
import LeaseFields from "./LeaseFields";

interface ExtractedReport {
    extractedData: Record<string, ReactNode>;
    words?: unknown[];
}

interface ViewFinancialStatementReportProps {
    financialStatement: ExtractedReport;
}

function ViewFinancialStatementReport(props: ViewFinancialStatementReportProps)
{
    const [financialStatement, setFinancialStatement] = React.useState<ExtractedReport>({
        extractedData:{},
        words: []
    });

    React.useEffect(() =>
    {
        setFinancialStatement(props.financialStatement);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps -- preserve the legacy mount-only report snapshot.

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
                                                    <td>{financialStatement.extractedData[field.field]}</td>
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

export default ViewFinancialStatementReport;

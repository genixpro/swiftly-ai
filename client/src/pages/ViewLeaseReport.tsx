import React, {type ReactNode} from 'react';
import {Row, Col, Card, CardHeader, CardBody} from 'reactstrap';
import LeaseFields from "./LeaseFields";
import type {FileDTO} from '@api/types';

interface ExtractedLeaseReport {
    extractedData?: Record<string, unknown>;
    words?: unknown[];
}

interface ViewLeaseReportProps {
    lease: ExtractedLeaseReport;
    saveLeaseData?(lease: FileDTO): Promise<void>;
}

function ViewLeaseReport(props: ViewLeaseReportProps) {
    const [lease, setLease] = React.useState<ExtractedLeaseReport>({
        extractedData: {},
        words: []
    });

    React.useEffect(() => {
        setLease(props.lease);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps -- preserve the legacy mount-only report snapshot.

    const extractedData = lease.extractedData ?? {};

        return (
            <Row>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>
                            <div id={"view-lease-report"}>
                                <Row>
                                    <Col xs={12} md={8}>
                                        <Card outline color="primary" className="mb-3">
                                            <CardHeader className="text-white bg-primary">Property
                                                Description</CardHeader>

                                            <table>
                                                <tbody>
                                                {
                                                    LeaseFields.map((group) => {
                                                        return group.fields.map((field) =>
                                                            <tr className={"lease-report-row"} key={field.field}>
                                                                <td className={"lease-report-variable-name"}>{field.name}</td>
                                                                <td>{extractedData[field.field] as ReactNode}</td>
                                                            </tr>);
                                                    })
                                                }
                                                </tbody>
                                            </table>
                                        </Card>
                                    </Col>
                                </Row>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        );
}

export default ViewLeaseReport;

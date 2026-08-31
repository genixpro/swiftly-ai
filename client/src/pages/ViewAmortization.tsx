import { Row, Col, Card, CardBody, Button } from 'reactstrap';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import '@components/Common/datetime-compat.css'
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import {createAmortizationItem, type AmortizationItem} from '../domain/amortization';
import type {AppraisalDTO} from '../api/types';

interface AmortizationAppraisal extends AppraisalDTO {
    _id: string;
    amortizationSchedule: {items: AmortizationItem[]};
}

interface ViewAmortizationProps {
    appraisal: AmortizationAppraisal;
    saveAppraisal(appraisal: AmortizationAppraisal): void;
}

/** Mirrors the legacy underscore callback guard for each rendered inline field. */
function once(callback: (value: unknown) => void): (value: unknown) => void {
    let called = false;
    return (value) => {
        if (called) return;
        called = true;
        callback(value);
    };
}

function ViewAmortization(props: ViewAmortizationProps)
{
    function removeAmortization(amortizationIndex: number)
    {
        props.appraisal.amortizationSchedule.items.splice(amortizationIndex, 1);
        props.saveAppraisal(props.appraisal);
    }

    function changeAmortizationField(amortization: AmortizationItem, field: string, newValue: unknown)
    {
        amortization[field] = newValue;
        props.saveAppraisal(props.appraisal);
    }

    function createNewAmortization(field?: string, value?: unknown)
    {
        const newAmortization = createAmortizationItem(field, value);
        if (!newAmortization) return;
        props.appraisal.amortizationSchedule.items.push(newAmortization);
        props.saveAppraisal(props.appraisal);
    }

    function renderAmortization(amortization: AmortizationItem, amortizationIndex: number)
    {
        return <tr
            className={"tenant-row"}
            key={amortizationIndex}
        >
            <td>
                <FieldDisplayEdit
                    hideIcon={true}
                    value={amortization.name}
                    placeholder={"name"}
                    onChange={once((newValue: unknown) => changeAmortizationField(amortization, "name", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type={"currency"}
                    hideIcon={true}
                    value={amortization.amount}
                    placeholder={"Amount"}
                    onChange={once((newValue: unknown) => changeAmortizationField(amortization, "amount", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type={"percent"}
                    hideIcon={true}
                    value={amortization.interest}
                    placeholder={"Interest"}
                    onChange={once((newValue: unknown) => changeAmortizationField(amortization, "interest", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type={"percent"}
                    hideIcon={true}
                    value={amortization.discountRate}
                    placeholder={"Discount Rate"}
                    onChange={once((newValue: unknown) => changeAmortizationField(amortization, "discountRate", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type={"date"}
                    hideIcon={true}
                    value={amortization.startDate}
                    placeholder={"Start Date"}
                    onChange={once((newValue: unknown) => changeAmortizationField(amortization, "startDate", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type='months'
                    value={amortization.periodMonths}
                    placeholder={"Period (months)"}
                    onChange={(newValue: unknown) => changeAmortizationField(amortization, 'periodMonths', newValue)}/>
            </td>

            <td className={"action-column"}>
                <Button
                    color="secondary"
                    onClick={() => removeAmortization(amortizationIndex)}
                    title={"Delete Amortization Item"}
                    aria-label={"Delete Amortization Item"}
                >
                    <i className="fa fa-trash-alt"></i>
                </Button>
            </td>
        </tr>;
    }


    function renderNewAmortization()
    {
        return <tr className={"tenant-row"} key={props.appraisal.amortizationSchedule.items.length}>
            <td>
                <FieldDisplayEdit
                    hideIcon={true}
                    value={""}
                    placeholder={"name"}
                    onChange={once((newValue: unknown) => createNewAmortization("name", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type={"currency"}
                    hideIcon={true}
                    value={""}
                    placeholder={"Amount"}
                    onChange={once((newValue: unknown) => createNewAmortization("amount", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type={"percent"}
                    hideIcon={true}
                    value={""}
                    placeholder={"Interest"}
                    onChange={once((newValue: unknown) => createNewAmortization("interest", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type={"percent"}
                    hideIcon={true}
                    value={""}
                    placeholder={"Discount Rate"}
                    onChange={once((newValue: unknown) => createNewAmortization("discountRate", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type={"date"}
                    hideIcon={true}
                    value={""}
                    placeholder={"Date"}
                    onChange={once((newValue: unknown) => createNewAmortization("startDate", newValue))}
                />
            </td>
            <td>
                <FieldDisplayEdit
                    type='months'
                    value={""}
                    placeholder={"Period (months)"}
                    onChange={(newValue: unknown) => createNewAmortization('periodMonths', newValue)}/>
            </td>

            <td className={"action-column"}>
                <Button
                    color="secondary"
                    onClick={() => createNewAmortization()}
                    title={"New Amortization Item"}
                    aria-label={"New Amortization Item"}
                >
                    <i className="fa fa-plus-square"></i>
                </Button>
            </td>
        </tr>;
    }

        return (
            <div id={"view-amortization"} className={"view-amortization"}>
                <AppraisalContentHeader key={1} appraisal={props.appraisal} title="Amortization Schedule" />
                <Row key={3}>
                    <Col xs={12}>
                        <Card className="card-default">
                            <CardBody>

                                <Row>
                                    <Col xs={10}>
                                        <h3>Amortization Schedule</h3>
                                    </Col>
                                    {/*<Col xs={2}>*/}
                                    {/*    <Dropdown isOpen={this.state.downloadDropdownOpen} toggle={this.toggleDownload.bind(this)}>*/}
                                    {/*        <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>*/}
                                    {/*            Download*/}
                                    {/*        </DropdownToggle>*/}
                                    {/*        <DropdownMenu>*/}
                                    {/*            <DropdownItem onClick={() => this.downloadWordAmortizationSchedule()}>Amortization Schedule Summary (docx)</DropdownItem>*/}
                                    {/*            <DropdownItem onClick={() => this.downloadExcelAmortizationSchedule()}>Amortization Schedule Spreadsheet (xlsx)</DropdownItem>*/}
                                    {/*        </DropdownMenu>*/}
                                    {/*    </Dropdown>*/}
                                    {/*</Col>*/}
                                </Row>
                                <Row>
                                    <Col xs={12} md={12} lg={12} xl={12}>
                                        <div className="table-responsive">
                                        <table className="table amortization-table">
                                            <thead>
                                                <tr>
                                                    <td>Name</td>
                                                    <td>Amount ($)</td>
                                                    <td>Interest (%)</td>
                                                    <td>Discount Rate (%)</td>
                                                    <td>Start Date</td>
                                                    <td>Period</td>
                                                    <td className="action-column" />
                                                </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                props.appraisal.amortizationSchedule.items.map((item, tenancyIndex) => {
                                                    return renderAmortization(item, tenancyIndex);
                                                }).concat([renderNewAmortization()])
                                            }
                                            </tbody>

                                        </table>
                                        </div>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
}

export default ViewAmortization;

import React from 'react';
import {Row, Col, Card, CardBody, DropdownMenu, Dropdown, DropdownToggle, DropdownItem} from 'reactstrap';
import axios from 'axios';
import ComparableSaleList from "./components/ComparableSaleList";
import Promise from 'bluebird';
import _ from 'underscore';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import ComparableSaleSearch from './components/ComparableSaleSearch';
import ComparableLeaseList from "./components/ComparableLeaseList";


class ViewAppraisalComparableLeases extends React.Component {
    state = {
        comparableLeases: []
    };

    createNewComparable(newComparable)
    {
        const comparables = this.state.comparableLeases;
        comparables.splice(0, 0, newComparable);
        this.setState({comparableLeases: comparables});
    }

    onComparablesChanged(comps)
    {
        this.setState({comparableLeases: comps});
    }

    addComparableToAppraisal(comp)
    {
        const appraisal = this.props.appraisal;
        appraisal.comparableLeases.push(comp._id['$oid']);
        appraisal.comparableLeases = _.clone(appraisal.comparableLeases);
        this.props.saveDocument(appraisal);
    }


    removeComparableFromAppraisal(comp)
    {
        const appraisal = this.props.appraisal;
        for (let i = 0; i < appraisal.comparableLeases.length; i += 1)
        {
            if (appraisal.comparableLeases[i] === comp._id['$oid'])
            {
                appraisal.comparableLeases.splice(i, 1);
                break;
            }
        }
        appraisal.comparableLeases = _.clone(appraisal.comparableLeases);
        this.props.saveDocument(appraisal);
    }

    toggleDownload()
    {
        this.setState({downloadDropdownOpen: !this.state.downloadDropdownOpen})
    }


    downloadExcelSummary()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id['$oid']}/comparable_leases/excel`;
    }


    downloadWordSummary()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id['$oid']}/comparable_leases/word`;
    }


    render()
    {
        if (!this.props.appraisal)
        {
            return null;
        }

        return [
            <div className={"view-appraisal-comparable-leases"}>
                <Row>
                    <Col xs={10}>
                        <h3>View Comparable Leases</h3>
                    </Col>
                    <Col xs={2}>
                        <Dropdown isOpen={this.state.downloadDropdownOpen} toggle={this.toggleDownload.bind(this)}>
                            <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>
                                Download
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem onClick={() => this.downloadExcelSummary()}>Spreadsheet (xls)</DropdownItem>
                                <DropdownItem onClick={() => this.downloadWordSummary()}>Cap-Rate Summary (docx)</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <ComparableLeaseList comparableLeaseIds={this.props.appraisal.comparableLeases}
                                            allowNew={false}
                                            history={this.props.history}
                                            appraisalId={this.props.match.params._id}
                                            onRemoveComparableClicked={(comp) => this.removeComparableFromAppraisal(comp)}
                                            onChange={(comps) => this.onComparablesChanged(comps)}
                        />
                    </Col>
                </Row>
            </div>
        ];
    }
}

export default ViewAppraisalComparableLeases;

import { reportUrl } from "@api/client";
import React from 'react';
import {Row, Col, DropdownMenu, Dropdown, DropdownToggle, DropdownItem} from 'reactstrap';
import {comparableLeasesApi} from '@api/resources';
import _ from 'underscore';
import ComparableLeaseList from "./components/ComparableLeaseList";
import ComparableLeasesMap from "./components/ComparableLeasesMap";
import ComparableLeaseModel from "../models/ComparableLeaseModel";


class ViewAppraisalComparableLeases extends React.Component {
    state = {
        comparableLeases: [],
        sort: "-leaseDate"
    };

    loadedComparables = {};

    componentDidMount()
    {
        comparableLeasesApi.getMany(this.props.appraisal.comparableLeases).then((comparableLeases) =>
        {
            const models = comparableLeases.map((item) => ComparableLeaseModel.create(item));
            this.setState({comparableLeases: ComparableLeaseModel.sortComparables(models, this.state.sort)})
        })
    }

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
        appraisal.comparableLeases.push(comp._id);
        appraisal.comparableLeases = _.clone(appraisal.comparableLeases);
        this.props.saveAppraisal(appraisal);
    }


    removeComparableFromAppraisal(comp)
    {
        const appraisal = this.props.appraisal;
        const comparables = this.state.comparableLeases;
        for (let i = 0; i < appraisal.comparableLeases.length; i += 1)
        {
            if (appraisal.comparableLeases[i] === comp._id)
            {
                appraisal.comparableLeases.splice(i, 1);
                comparables.splice(i, 1);
                break;
            }
        }
        appraisal.comparableLeases = _.clone(appraisal.comparableLeases);
        this.props.saveAppraisal(appraisal);
        this.setState({comparableLeases: comparables});
    }

    toggleDownload()
    {
        this.setState({downloadDropdownOpen: !this.state.downloadDropdownOpen})
    }


    downloadExcelSummary()
    {
        window.location = reportUrl(this.props.appraisal._id, "comparable_leases", "excel");
    }


    downloadWordSummary()
    {
        window.location = reportUrl(this.props.appraisal._id, "comparable_leases", "word");
    }

    onSortChanged(newSort)
    {
        this.setState({
            sort: newSort,
            comparableLeases: ComparableLeaseModel.sortComparables(this.state.comparableLeases, newSort)
        })
    }


    render()
    {
        if (!this.props.appraisal)
        {
            return null;
        }

        return [
            <div key="appraisal-comparable-leases" className={"view-appraisal-comparable-leases"}>
                <Row>
                    <Col xs={10}>
                        <h3>View Comparable Leases</h3>
                    </Col>
                    {/*<Col xs={2}>*/}
                    {/*    <Dropdown isOpen={this.state.downloadDropdownOpen} toggle={this.toggleDownload.bind(this)}>*/}
                    {/*        <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>*/}
                    {/*            Download*/}
                    {/*        </DropdownToggle>*/}
                    {/*        <DropdownMenu>*/}
                    {/*            /!*<DropdownItem onClick={() => this.downloadExcelSummary()}>Spreadsheet (xls)</DropdownItem>*!/*/}
                    {/*            <DropdownItem onClick={() => this.downloadWordSummary()}>Cap-Rate Summary (docx)</DropdownItem>*/}
                    {/*        </DropdownMenu>*/}
                    {/*    </Dropdown>*/}
                    {/*</Col>*/}
                </Row>
                <Row>
                    <Col xs={12} md={8} className="comparables-list-column">
                        <ComparableLeaseList comparableLeases={this.state.comparableLeases}
                                             statsTitle={"Statistics for Selected Comps"}
                                            allowNew={false}
                                             sort={this.state.sort}
                                             onSortChanged={(newSort) => this.onSortChanged(newSort)}
                                             noCompMessage={"There are no comparables attached to this appraisal. Please go to the comparables database and select comparables from there."}
                                            navigate={this.props.navigate} search={this.props.search}
                                            appraisalId={this.props.appraisalId}
                                            appraisalComparables={this.props.appraisal.comparableLeases}
                                            appraisal={this.props.appraisal}
                                            onRemoveComparableClicked={(comp) => this.removeComparableFromAppraisal(comp)}
                                            onChange={(comps) => this.onComparablesChanged(comps)}
                        />
                    </Col>
                    <Col xs={12} md={4} className="comparables-map-column">
                        <ComparableLeasesMap
                            appraisal={this.props.appraisal}
                            comparableLeases={this.state.comparableLeases}
                            onAddComparableToAppraisal={(comp) => this.addComparableToAppraisal(comp)}
                            onRemoveComparableFromAppraisal={(comp) => this.removeComparableFromAppraisal(comp)}
                        />
                    </Col>
                </Row>
            </div>
        ];
    }
}

export default ViewAppraisalComparableLeases;

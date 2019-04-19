import React from 'react';
import {Row, Col, DropdownMenu, Dropdown, DropdownToggle, DropdownItem} from 'reactstrap';
import axios from 'axios';
import ComparableSaleList from "./components/ComparableSaleList";
import Promise from 'bluebird';
import _ from 'underscore';
import ComparableSalesMap from './components/ComparableSalesMap';
import ComparableSaleModel from "../models/ComparableSaleModel";
import Auth from "../Auth";


class ViewAppraisalComparableSales extends React.Component {
    state = {
        comparableSales: [],
        sort: "-saleDate"
    };

    loadedComparables = {};

    componentDidMount()
    {
         Promise.map(this.props.appraisal.comparableSales, (comparableSaleId) =>
        {
            if (this.loadedComparables[comparableSaleId])
            {
                return this.loadedComparables[comparableSaleId];
            }
            else
            {
                return axios.get(`/comparable_sales/` + comparableSaleId).then((response) =>
                {
                    if (response.data.comparableSale)
                    {
                        this.loadedComparables[comparableSaleId] = ComparableSaleModel.create(response.data.comparableSale);
                        return this.loadedComparables[comparableSaleId];
                    }
                });
            }
        }).then((comparableSales) =>
        {
            this.setState({comparableSales: ComparableSaleModel.sortComparables(comparableSales.filter((item) => item), this.state.sort)})
        })
    }

    onComparablesChanged(comps)
    {
        this.setState({comparableSales: comps});
    }

    addComparableToAppraisal(comp)
    {
        const appraisal = this.props.appraisal;
        appraisal.comparableSales.push(comp._id);
        appraisal.comparableSales = _.clone(appraisal.comparableSales);
        this.props.saveAppraisal(appraisal);
    }


    removeComparableFromAppraisal(comp)
    {
        const appraisal = this.props.appraisal;
        const comparables = this.state.comparableSales;
        for (let i = 0; i < appraisal.comparableSales.length; i += 1)
        {
            if (appraisal.comparableSales[i] === comp._id)
            {
                appraisal.comparableSales.splice(i, 1);
                comparables.splice(i, 1);
                break;
            }
        }
        appraisal.comparableSales = _.clone(appraisal.comparableSales);
        this.props.saveAppraisal(appraisal);
        this.setState({comparableSales: comparables});
    }

    toggle()
    {
        this.setState({downloadDropdownOpen: !this.state.downloadDropdownOpen})
    }


    downloadExcelSummary()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/comparable_sales/excel?access_token=${Auth.getAccessToken()}`;
    }


    downloadWordSummary()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/comparable_sales/word?access_token=${Auth.getAccessToken()}`;
    }


    downloadDetailedSummary()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/comparable_sales/detailed_word?access_token=${Auth.getAccessToken()}`;
    }

    onSortChanged(newSort)
    {
        this.setState({
            sort: newSort,
            comparableSales: ComparableSaleModel.sortComparables(this.state.comparableSales, newSort)
        })
    }


    render()
    {
        if (!this.props.appraisal)
        {
            return null;
        }

        return [
                <div className={"view-appraisal-comparable-sales"}>
                    <Row>
                        <Col xs={10}>
                            <h3>View Comparable Sales</h3>
                        </Col>
                        <Col xs={2}>
                            <Dropdown isOpen={this.state.downloadDropdownOpen} toggle={this.toggle.bind(this)}>
                                <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>
                                    Download
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={() => this.downloadExcelSummary()}>Spreadsheet (xls)</DropdownItem>
                                    <DropdownItem onClick={() => this.downloadWordSummary()}>Cap-Rate Summary (docx)</DropdownItem>
                                    <DropdownItem onClick={() => this.downloadDetailedSummary()}>Detailed Summary (docx)</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={8}>
                            <ComparableSaleList comparableSales={this.state.comparableSales}
                                                statsTitle={"Statistics for Selected Comps"}
                                                allowNew={false}
                                                sort={this.state.sort}
                                                onSortChanged={(newSort) => this.onSortChanged(newSort)}
                                                noCompMessage={"There are no comparables attached to this appraisal. Please go to the comparables database and select comparables from there."}
                                                history={this.props.history}
                                                appraisal={this.props.appraisal}
                                                appraisalId={this.props.match.params._id}
                                                appraisalComparables={this.props.appraisal.comparableSales}
                                                onRemoveComparableClicked={(comp) => this.removeComparableFromAppraisal(comp)}
                                                onChange={(comps) => this.onComparablesChanged(comps)}
                            />
                        </Col>
                        <Col xs={4}>
                            <ComparableSalesMap
                                appraisal={this.props.appraisal}
                                comparableSales={this.state.comparableSales}
                                onAddComparableToAppraisal={(comp) => this.addComparableToAppraisal(comp)}
                                onRemoveComparableFromAppraisal={(comp) => this.removeComparableFromAppraisal(comp)}
                            />
                        </Col>
                    </Row>
                </div>
        ];
    }
}

export default ViewAppraisalComparableSales;

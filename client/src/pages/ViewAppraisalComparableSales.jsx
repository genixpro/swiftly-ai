import { reportUrl } from "@api/client";
import React from 'react';
import {Row, Col, DropdownMenu, Dropdown, DropdownToggle, DropdownItem} from 'reactstrap';
import {comparableSalesApi} from '@api/resources';
import ComparableSaleList from "./components/ComparableSaleList";
import _ from 'underscore';
import ComparableSalesMap from './components/ComparableSalesMap';
import ComparableSaleModel from "../models/ComparableSaleModel";


class ViewAppraisalComparableSales extends React.Component {
    static defaultProps = {
        compsField: "comparableSalesCapRate"
    };

    state = {
        comparableSales: [],
        sort: "-saleDate"
    };

    loadedComparables = {};

    field = "";

    componentDidMount()
    {
        this.field = this.props.compsField;
        comparableSalesApi.getMany(this.props.appraisal[this.props.compsField]).then((comparableSales) =>
        {
            const models = comparableSales.map((item) => ComparableSaleModel.create(item));
            this.setState({comparableSales: ComparableSaleModel.sortComparables(models, this.state.sort)})
        })
    }

    componentDidUpdate()
    {
        if (this.props.compsField !== this.field)
        {
            this.componentDidMount();
        }
    }

    onComparablesChanged(comps)
    {
        this.setState({comparableSales: comps});
    }

    addComparableToAppraisal(comp)
    {
        const appraisal = this.props.appraisal;
        appraisal[this.props.compsField].push(comp._id);
        appraisal[this.props.compsField] = _.clone(appraisal[this.props.compsField]);
        this.props.saveAppraisal(appraisal);
    }

    addComparableToDCA(comp)
    {
        const appraisal = this.props.appraisal;

        appraisal.comparableSalesDCA.push(comp._id);
        appraisal.comparableSalesDCA = _.clone(appraisal.comparableSalesDCA);
        this.props.saveAppraisal(appraisal);
    }

    addComparableToCapRate(comp)
    {
        const appraisal = this.props.appraisal;

        appraisal.comparableSalesCapRate.push(comp._id);
        appraisal.comparableSalesCapRate = _.clone(appraisal.comparableSalesCapRate);
        this.props.saveAppraisal(appraisal);
    }


    removeComparableFromDCA(comp)
    {
        const appraisal = this.props.appraisal;
        for (let i = 0; i < appraisal.comparableSalesDCA.length; i += 1)
        {
            if (appraisal.comparableSalesDCA[i] === comp._id)
            {
                appraisal.comparableSalesDCA.splice(i, 1);
                break;
            }
        }
        appraisal.comparableSalesDCA = _.clone(appraisal.comparableSalesDCA);
        this.props.saveAppraisal(appraisal);
    }


    removeComparableFromCapRate(comp)
    {
        const appraisal = this.props.appraisal;
        for (let i = 0; i < appraisal.comparableSalesCapRate.length; i += 1)
        {
            if (appraisal.comparableSalesCapRate[i] === comp._id)
            {
                appraisal.comparableSalesCapRate.splice(i, 1);
                break;
            }
        }
        appraisal.comparableSalesCapRate = _.clone(appraisal.comparableSalesCapRate);
        this.props.saveAppraisal(appraisal);
    }


    removeComparableFromAppraisal(comp)
    {
        const appraisal = this.props.appraisal;
        const comparables = this.state.comparableSales;
        for (let i = 0; i < appraisal[this.props.compsField].length; i += 1)
        {
            if (appraisal[this.props.compsField][i] === comp._id)
            {
                appraisal[this.props.compsField].splice(i, 1);
                comparables.splice(i, 1);
                break;
            }
        }
        appraisal[this.props.compsField] = _.clone(appraisal[this.props.compsField]);
        this.props.saveAppraisal(appraisal);
        this.setState({comparableSales: comparables});
    }

    toggle()
    {
        this.setState({downloadDropdownOpen: !this.state.downloadDropdownOpen})
    }


    downloadExcelSummary()
    {
        window.location = reportUrl(this.props.appraisal._id, "comparable_sales", "excel");
    }


    downloadWordSummary()
    {
        window.location = reportUrl(this.props.appraisal._id, "comparable_sales", "word");
    }


    downloadDetailedSummary()
    {
        window.location = reportUrl(this.props.appraisal._id, "comparable_sales", "detailed_word");
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
                <div key="appraisal-comparable-sales" className={"view-appraisal-comparable-sales"}>
                    <Row>
                        <Col xs={10}>
                            <h3>View Comparable Sales</h3>
                        </Col>
                        {/*<Col xs={2}>*/}
                        {/*    <Dropdown isOpen={this.state.downloadDropdownOpen} toggle={this.toggle.bind(this)}>*/}
                        {/*        <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>*/}
                        {/*            Download*/}
                        {/*        </DropdownToggle>*/}
                        {/*        <DropdownMenu>*/}
                        {/*            /!*<DropdownItem onClick={() => this.downloadExcelSummary()}>Spreadsheet (xls)</DropdownItem>*!/*/}
                        {/*            <DropdownItem onClick={() => this.downloadWordSummary()}>Cap-Rate Summary (docx)</DropdownItem>*/}
                        {/*            <DropdownItem onClick={() => this.downloadDetailedSummary()}>Detailed Summary (docx)</DropdownItem>*/}
                        {/*        </DropdownMenu>*/}
                        {/*    </Dropdown>*/}
                        {/*</Col>*/}
                    </Row>
                    <Row>
                        <Col xs={12} md={8} className="comparables-list-column">
                            <ComparableSaleList comparableSales={this.state.comparableSales}
                                                statsTitle={"Statistics for Selected Comps"}
                                                allowNew={false}
                                                sort={this.state.sort}
                                                onSortChanged={(newSort) => this.onSortChanged(newSort)}
                                                noCompMessage={"There are no comparables attached to this appraisal. Please go to the comparables database and select comparables from there."}
                                                navigate={this.props.navigate} search={this.props.search}
                                                appraisal={this.props.appraisal}
                                                appraisalId={this.props.appraisalId}
                                                appraisalComparables={this.props.appraisal[this.props.compsField]}
                                                onRemoveComparableClicked={(comp) => this.removeComparableFromAppraisal(comp)}
                                                onChange={(comps) => this.onComparablesChanged(comps)}
                                                onRemoveDCAClicked={(comp) => this.removeComparableFromDCA(comp)}
                                                onRemoveCapRateClicked={(comp) => this.removeComparableFromCapRate(comp)}
                                                onAddDCAClicked={(comp) => this.addComparableToDCA(comp)}
                                                onAddCapRateClicked={(comp) => this.addComparableToCapRate(comp)}
                            />
                        </Col>
                        <Col xs={12} md={4} className="comparables-map-column">
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

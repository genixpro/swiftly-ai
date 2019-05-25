import React from 'react';
import {Row, Col, Button, DropdownItem, DropdownToggle, Dropdown, DropdownMenu, Alert, Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import NumberFormat from 'react-number-format';
import {Link} from "react-router-dom";
import _ from 'underscore';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css'
import UnitsTable from "./components/UnitsTable";
import Auth from "../Auth";
import FileViewer from "./components/FileViewer";
import FileSelector from "./components/FileSelector";
import {TenancyModel} from "../models/UnitModel";
import CurrencyFormat from "./components/CurrencyFormat";
import IntegerFormat from "./components/IntegerFormat";
import moment from "moment/moment";
import PercentFormat from "./components/PercentFormat";
import AreaFormat from "./components/AreaFormat";
import Moment from "react-moment";
import axios from "axios/index";
import FileModel from "../models/FileModel";
import ActionButton from "./components/ActionButton";

class ViewTenantsRentRoll extends React.Component
{
    state = {};

    componentDidMount()
    {
        if (this.getQueryVariable("unit"))
        {
            this.setState({initialOpenUnit: this.getQueryVariable("unit")})
        }
    }

    getQueryVariable(variable)
    {
        let query = this.props.history.location.search.substring(1);
        let vars = query.split('&');
        for (let i = 0; i < vars.length; i++) {
            let pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) === variable) {
                return decodeURIComponent(pair[1]);
            }
        }
        console.log('Query variable %s not found', variable);
    }

    onRemoveUnit(unitIndex)
    {
        this.props.appraisal.units.splice(unitIndex, 1);

        this.props.saveAppraisal(this.props.appraisal);
    }

    onCreateUnit(newUnit)
    {
        this.props.appraisal.units.push(newUnit);
        this.props.saveAppraisal(this.props.appraisal);

    }

    onUnitChanged(unitIndex, newUnit)
    {
        this.props.appraisal.units[unitIndex] = newUnit;
        this.props.saveAppraisal(this.props.appraisal);
    }

    onChangeUnitOrder(newUnits)
    {
        this.props.appraisal.units = newUnits;
        this.props.saveAppraisal(this.props.appraisal);
    }

    toggleDownload()
    {
        this.setState({downloadDropdownOpen: !this.state.downloadDropdownOpen})
    }

    downloadWordRentRoll()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/rent_roll/word?access_token=${Auth.getAccessToken()}`;
    }

    downloadExcelRentRoll()
    {
        window.location = `${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisal._id}/rent_roll/excel?access_token=${Auth.getAccessToken()}`;
    }

    onFileChanged(fileId)
    {
        if (!this.state.file || this.state.file._id !== fileId)
        {
            axios.get(`/appraisal/${this.props.appraisal._id}/files/${fileId}`).then((response) =>
            {
                this.setState({file: FileModel.create(response.data.file)});
            });
        }
    }

    createComparablesForTenancies()
    {
        const promise = axios.post(`/appraisal/${this.props.appraisal._id}/convert_tenants`).then((response) =>
        {

        });
        return promise;
    }


    render()
    {
        return (
            (this.props.appraisal) ?
                <div id={"view-tenants-rent-roll"} className={"view-tenants-rent-roll"}>
                    <Row>
                        <Col xs={6}>
                            <h3>View Tenants</h3>
                        </Col>
                        <Col xs={6} className={"button-bar"}>
                            <ActionButton onClick={() => this.createComparablesForTenancies()} color={"primary"}>
                                Add Tenancies to your Comparable Leases Database
                            </ActionButton>
                            <Dropdown isOpen={this.state.downloadDropdownOpen} toggle={this.toggleDownload.bind(this)}>
                                <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>
                                    Download
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={() => this.downloadWordRentRoll()}>Rent Roll Summary (docx)</DropdownItem>
                                    <DropdownItem onClick={() => this.downloadExcelRentRoll()}>Rent Roll Spreadsheet (xlsx)</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </Col>
                    </Row>
                    {
                        this.props.appraisal.units.length === 0 ?

                            <Alert color="danger">
                                There is no Rent Roll on file.
                            </Alert>
                            : null
                    }
                    <Row>
                        <Col xs={6} md={6} lg={6} xl={6}>
                            <UnitsTable
                                appraisal={this.props.appraisal}
                                initialOpenUnit={this.state.initialOpenUnit}
                                onUnitClicked={(unit, unitIndex) => this.onUnitClicked(unitIndex)}
                                onRemoveUnit={(unitIndex) => this.onRemoveUnit(unitIndex)}
                                onCreateUnit={(newUnit) => this.onCreateUnit(newUnit)}
                                onUnitChanged={(unitIndex, newUnit) => this.onUnitChanged(unitIndex, newUnit)}
                                onChangeUnitOrder={(newUnits) => this.onChangeUnitOrder(newUnits)}
                                history={this.props.history}
                            />
                        </Col>
                        <Col xs={6} md={6} lg={6} xl={6}>
                            <Row className={"file-selector-row"}>
                                <Col xs={12}>
                                    <FileSelector
                                        appraisalId={this.props.appraisal._id}
                                        onChange={(fileId) => this.onFileChanged(fileId)}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                {
                                    this.state.file ?
                                        <Col xs={12}>
                                            <FileViewer
                                                ref={(ref) => this.fileViewer = ref}
                                                document={this.state.file}
                                                hilightWords={this.state.hoverReference ? this.state.hoverReference.wordIndexes : []}
                                            />
                                        </Col> : null
                                }
                            </Row>
                        </Col>
                    </Row>
                </div>
                : null
        );
    }
}

export default ViewTenantsRentRoll;

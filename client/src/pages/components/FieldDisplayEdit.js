import React from 'react';
import { Button } from 'reactstrap';
import _ from 'underscore';
import Geosuggest from 'react-geosuggest';
import Datetime from 'react-datetime';
import PropertyTypeSelector from './PropertyTypeSelector';
import RentTypeSelector from './RentTypeSelector';
import MarketRentSelector from './MarketRentSelector';
import RetailLocationTypeSelector from './RetailLocationTypeSelector';
import ZoneSelector from "./ZoneSelector";
import TagEditor from "./TagEditor";
import CalculationFieldSelector from "./CalculationFieldSelector";
import LeasingCostsSelector from "./LeasingCostsSelector";

import {
    Input,
    InputGroup,
    InputGroupAddon
} from 'reactstrap';
import IncomeItemTypeSelector from "./IncomeItemTypeSelector";
import RecoveryStructureSelector from "./RecoveryStructureSelector";
import ManagementExpenseModeSelector from "./ManagementExpenseModeSelector";
import LeasingComissionModeSelector from "./LeasingCommissionModeSelector";
import ManagementRecoveryModeSelector from "./ManagementRecoveryModeSelector";
import DirectComparisonMetricSelector from "./DirectComparisonMetricSelector";
import TenancyTypeSelector from "./TenancyTypeSelector";
import TenantNameSelector from "./TenantNameSelector";
import {DropTarget} from "react-dnd/lib/index";
import ReactDOM from 'react-dom';

class FieldDisplayEdit extends React.Component
{
    static defaultProps = {
        edit: true,
        hideInput: true,
        cents: true
    };

    state = {
        isEditing: false
    };

    constructor()
    {
        super();
        this.inputElem = null;
        this.sentUpdate = false;
    }

    componentDidMount()
    {
        this.setState({value: this.formatValue(this.props.value)})
    }


    inputUpdated(newValue)
    {
        this.setState({value: newValue})
    }


    numberWithCommas(x)
    {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ", ");
    }


    formatValue(value)
    {
        if (value === "")
        {
            return "";
        }

        if (_.isUndefined(value))
        {
            return "";
        }

        if (_.isNull(value))
        {
            return "";
        }

        else if (this.props.type === 'currency')
        {
            try {
                if (this.props.cents)
                {
                    if (Number(value) < 0)
                    {
                        return "($" + this.numberWithCommas(Number(-value).toFixed(2).toString()) + ")";
                    }
                    else
                    {
                        return "$" + this.numberWithCommas(Number(value).toFixed(2).toString());
                    }
                }
                else
                {
                    if (Number(value) < 0)
                    {
                        return "($" + this.numberWithCommas(Number(-value).toFixed(0).toString()) + ")";
                    }
                    else
                    {
                        return "$" + this.numberWithCommas(Number(value).toFixed(0).toString());
                    }
                }
            }
            catch(err) {
                return "$" + this.numberWithCommas(value.toString());
            }
        }
        else if (this.props.type === 'percent')
        {
            try {
                return this.numberWithCommas(Number(value).toFixed(2).toString()) + "%";
            }
            catch(err) {
                return this.numberWithCommas(value.toString()) + "%";
            }
        }
        else if (this.props.type === 'number')
        {
            try {
                return this.numberWithCommas(Number(value).toFixed(0).toString());
            }
            catch(err) {
                return this.numberWithCommas(value.toString());
            }
        }
        else if (this.props.type === 'float')
        {
            try {
                return this.numberWithCommas(Number(value).toFixed(2).toString());
            }
            catch(err) {
                return this.numberWithCommas(value.toString());
            }
        }
        else if (this.props.type === 'length')
        {
            try {
                return this.numberWithCommas(Number(value).toFixed(0).toString()) + " ft";
            }
            catch(err) {
                return this.numberWithCommas(value.toString());
            }
        }
        else if (this.props.type === 'area')
        {
            try {
                return this.numberWithCommas(Number(value).toFixed(0).toString()) + " sqft";
            }
            catch(err) {
                return this.numberWithCommas(value.toString());
            }
        }
        else if (this.props.type === 'acres')
        {

            try {
                return this.numberWithCommas(Number(value).toFixed(2).toString()) + " ac";
            }
            catch(err) {
                return this.numberWithCommas(value.toString());
            }
        }
        else if (this.props.type === 'months')
        {
            try {
                return this.numberWithCommas(Number(value).toFixed(0).toString()) + " months";
            }
            catch(err) {
                return this.numberWithCommas(value.toString());
            }
        }

        return value;
    }


    static cleanValue(type, value)
    {
        if (type === 'currency' ||
            type === 'number' ||
            type === 'percent' ||
            type === 'length' ||
            type === 'area' ||
            type === 'acres' ||
            type === 'months'
        )
        {
            const isNegative = value.toString().indexOf("-") !== -1 || value.toString().indexOf("(") !== -1 || value.toString().indexOf(")") !== -1;

            let cleanText = value.toString().replace(/[^0-9.]/g, "");

            if (type === 'number' ||
                type === 'length' ||
                type === 'area' ||
                type === 'months')
            {
                cleanText = cleanText.replace(/\.[0-9]*/g, "");
            }

            if (cleanText === "")
            {
                return null;
            }

            try {

                if (isNegative)
                {
                    return -Number(cleanText);
                }
                else
                {
                    return Number(cleanText);
                }
            }
            catch(err) {
                return null;
            }
        }
        else if(type === 'tags')
        {
            if (!value)
            {
                return [];
            }
        }
        return value;
    }

    startEditing()
    {
        this.sentUpdate = false;
        this.setState({value: this.formatValue(this.props.value), isEditing: true});
        if (this.props.onStartEditing)
        {
            this.props.onStartEditing();
        }
    }

    dateInputUpdated(newValue)
    {
        if (newValue)
        {
            this.setState({value: newValue}, () => this.finishEditing());
        }
        else if (newValue === null)
        {
            this.setState({value: newValue}, () => this.finishEditing());
        }
    }

    addressInputUpdated(newValue)
    {
        if (newValue)
        {
            this.setState({value: newValue.label, geo: newValue.location}, () => this.finishEditing());

            if (this.props.onGeoChange)
            {
                this.props.onGeoChange(newValue.location);
            }
        }
    }

    selectInputUpdated(newValue)
    {
        this.setState({value: newValue}, () => this.finishEditing());
    }

    tagInputUpdated(newValue)
    {
        // if (newValue)
        // {
        this.setState({value: newValue});
        this.props.onChange(FieldDisplayEdit.cleanValue(this.props.type, newValue));
        // }
    }

    tenantNameInputUpdated(newValue)
    {
        this.setState({value: newValue});
        this.props.onChange(newValue);
    }

    zoneInputUpdated(newValue)
    {
        // if (newValue)
        // {
        this.setState({value: newValue});
        this.props.onChange(newValue);
        // }
    }


    finishEditing()
    {
        if (!this.sentUpdate)
        {
            this.sentUpdate = true;

            if (this.props.onChange)
            {
                this.setState({value: this.formatValue(FieldDisplayEdit.cleanValue(this.props.type, this.state.value)) });
                this.props.onChange(FieldDisplayEdit.cleanValue(this.props.type, this.state.value));
            }

            if (this.inputElem)
            {
                this.inputElem.blur();
            }
            this.setState({isEditing: false});
        }
    }


    viewExtractionInputs()
    {
        this.props.onViewExtractionReference(this.props.extractionReference);
        this.setState({isEditing: false});
    }


    handleKeyPress(e)
    {
        if (e.key === 'Enter') {
            this.finishEditing();
        }
    }


    render() {

        const editStateClass = (this.state.isEditing ? " editing" : "static");
        const customClass = (this.props.className ? this.props.className : "");
        const editableClass = (this.props.edit === false ? "non-editable" : "editable");
        const hideInput = (this.props.hideInput === false ? "show-input" : "hide-input");
        const typeClass = `edit-type-${this.props.type}`;

        const rendered = (
            <div className={`field-display-edit ${editStateClass} ${customClass} ${editableClass} ${hideInput} ${typeClass}`}>
                <InputGroup
                            onFocus={(evt) => this.startEditing()}
                            title={this.props.title || this.props.placeholder}
                            style={this.props.style}
                >
                    {
                        this.props.type === "textbox" ?
                            <textarea
                                placeholder={this.props.placeholder}
                                title={this.props.title || this.props.placeholder}
                                disabled={!this.props.edit}
                                value={this.state.isEditing ? this.state.value : this.formatValue(this.props.value)}
                                onChange={(evt) => this.inputUpdated(evt.target.value)}
                                ref={(inputElem) => this.inputElem = inputElem}
                                onKeyPress={(evt) => this.handleKeyPress(evt)}
                                onBlur={(evt) => this.finishEditing()}
                                rows={1}
                            /> : null
                    }
                    {
                        this.props.type === "currency" || this.props.type === "number" ||
                        this.props.type === "float" ||
                        this.props.type === "percent" || this.props.type === "text" ||
                        this.props.type === "length" || this.props.type === "area" ||
                        this.props.type === "acres" || this.props.type === "months" ||
                        !this.props.type ?
                            <Input placeholder={this.props.placeholder}
                                   disabled={!this.props.edit}
                                   title={this.props.title || this.props.placeholder}
                                   value={this.state.isEditing ? this.state.value : this.formatValue(this.props.value)}
                                   onChange={(evt) => this.inputUpdated(evt.target.value)}
                                   innerRef={(inputElem) => this.inputElem = inputElem}
                                   onKeyPress={(evt) => this.handleKeyPress(evt)}
                                   onBlur={(evt) => this.finishEditing()}
                            /> : null
                    }
                    {
                        this.props.type === "date" ?
                            <Datetime
                                inputProps={{className: 'form-control', disabled: !this.props.edit, placeholder: this.props.placeholder}}
                                dateFormat={"YYYY/MM/DD"}
                                title={this.props.title || this.props.placeholder}
                                timeFormat={false}
                                input={true}
                                closeOnSelect={true}
                                value={this.state.isEditing ? this.state.value : this.formatValue(this.props.value)}
                                onChange={(newValue) => newValue.toDate ? this.dateInputUpdated(newValue.toDate()) : newValue === "" ? this.dateInputUpdated(null) : null}
                                onBlur={() => setTimeout(() => this.finishEditing(), 100)}
                            /> : null
                    }
                    {
                        this.props.type === "propertyType" ?
                            <PropertyTypeSelector
                                value={this.state.isEditing ? this.state.value : this.props.value}
                                title={this.props.title || this.props.placeholder}
                                disabled={!this.props.edit}
                                onChange={(newValue) => this.selectInputUpdated(newValue) }
                                onBlur={() => this.finishEditing()}
                                isSearch={this.props.isSearch}
                                innerRef={(inputElem) => this.inputElem = inputElem}
                            /> : null
                    }
                    {
                        this.props.type === "rentType" ?
                            <RentTypeSelector
                                value={this.state.isEditing ? this.state.value : this.props.value}
                                title={this.props.title || this.props.placeholder}
                                disabled={!this.props.edit}
                                onChange={(newValue) => this.selectInputUpdated(newValue) }
                                onBlur={() => this.finishEditing()}
                                innerRef={(inputElem) => this.inputElem = inputElem}
                            /> : null
                    }
                    {
                        this.props.type === "incomeItemType" ?
                            <IncomeItemTypeSelector
                                value={this.state.isEditing ? this.state.value : this.props.value}
                                title={this.props.title || this.props.placeholder}
                                disabled={!this.props.edit}
                                cashFlowType={this.props.cashFlowType}
                                onChange={(newValue) => this.selectInputUpdated(newValue) }
                                onBlur={() => this.finishEditing()}
                                innerRef={(inputElem) => this.inputElem = inputElem}
                            /> : null
                    }
                    {
                        this.props.type === "retailLocationType" ?
                            <RetailLocationTypeSelector
                                value={this.state.isEditing ? this.state.value : this.props.value}
                                title={this.props.title || this.props.placeholder}
                                disabled={!this.props.edit}
                                onChange={(newValue) => this.selectInputUpdated(newValue) }
                                onBlur={() => this.finishEditing()}
                                innerRef={(inputElem) => this.inputElem = inputElem}
                            /> : null
                    }
                    {
                        this.props.type === "marketRent" ?
                            <MarketRentSelector
                                value={this.props.value}
                                title={this.props.title || this.props.placeholder}
                                disabled={!this.props.edit}
                                marketRents={this.props.marketRents}
                                onChange={(newValue) => this.selectInputUpdated(newValue) }
                                onBlur={() => this.finishEditing()}
                                innerRef={(inputElem) => this.inputElem = inputElem}
                            /> : null
                    }
                    {
                        this.props.type === "recoveryStructure" ?
                            <RecoveryStructureSelector
                                value={this.props.value}
                                disabled={!this.props.edit}
                                title={this.props.title || this.props.placeholder}
                                recoveryStructures={this.props.recoveryStructures}
                                onChange={(newValue) => this.selectInputUpdated(newValue) }
                                onBlur={() => this.finishEditing()}
                                innerRef={(inputElem) => this.inputElem = inputElem}
                            /> : null
                    }
                    {
                        this.props.type === "leasingCostStructure" ?
                            <LeasingCostsSelector
                                value={this.props.value}
                                disabled={!this.props.edit}
                                title={this.props.title || this.props.placeholder}
                                leasingCostStructures={this.props.leasingCostStructures}
                                onChange={(newValue) => this.selectInputUpdated(newValue) }
                                onBlur={() => this.finishEditing()}
                                innerRef={(inputElem) => this.inputElem = inputElem}
                            /> : null
                    }
                    {
                        this.props.type === "boolean" ?
                            <input
                                type={"checkbox"}
                                checked={this.props.value}
                                disabled={!this.props.edit}
                                title={this.props.title || this.props.placeholder}
                                onChange={(evt) => this.selectInputUpdated(!this.props.value) }
                                onBlur={() => this.finishEditing()}
                                ref={(inputElem) => this.inputElem = inputElem}
                            /> : null
                    }
                    {
                        this.props.type === "calculationField" ?
                            <CalculationFieldSelector
                                expenses={this.props.expenses}
                                value={this.state.isEditing ? this.state.value : this.props.value}
                                disabled={!this.props.edit}
                                title={this.props.title || this.props.placeholder}
                                onChange={(newValue) => this.selectInputUpdated(newValue) }
                                onBlur={() => this.finishEditing()}
                                innerRef={(inputElem) => this.inputElem = inputElem}
                            /> : null
                    }
                    {
                        this.props.type === "managementExpenseMode" ?
                            <ManagementExpenseModeSelector
                                value={this.state.isEditing ? this.state.value : this.props.value}
                                disabled={!this.props.edit}
                                exclude={this.props.exclude}
                                title={this.props.title || this.props.placeholder}
                                onChange={(newValue) => this.selectInputUpdated(newValue) }
                                onBlur={() => this.finishEditing()}
                                innerRef={(inputElem) => this.inputElem = inputElem}
                            /> : null
                    }
                    {
                        this.props.type === "managementRecoveryMode" ?
                            <ManagementRecoveryModeSelector
                                value={this.state.isEditing ? this.state.value : this.props.value}
                                disabled={!this.props.edit}
                                title={this.props.title || this.props.placeholder}
                                onChange={(newValue) => this.selectInputUpdated(newValue) }
                                onBlur={() => this.finishEditing()}
                                innerRef={(inputElem) => this.inputElem = inputElem}
                            /> : null
                    }
                    {
                        this.props.type === "directComparisonMetric" ?
                            <DirectComparisonMetricSelector
                                value={this.state.isEditing ? this.state.value : this.props.value}
                                disabled={!this.props.edit}
                                title={this.props.title || this.props.placeholder}
                                onChange={(newValue) => this.selectInputUpdated(newValue) }
                                onBlur={() => this.finishEditing()}
                                innerRef={(inputElem) => this.inputElem = inputElem}
                            /> : null
                    }
                    {
                        this.props.type === "zone" ?
                            <ZoneSelector
                                title={this.props.title || this.props.placeholder}
                                disabled={!this.props.edit}
                                value={this.state.isEditing ? this.state.value : this.props.value}
                                onChange={(newValue) => this.zoneInputUpdated(newValue) }
                                onBlur={() => this.finishEditing()}
                            /> : null
                    }
                    {
                        this.props.type === "leasingCommissionMode" ?
                            <LeasingComissionModeSelector
                                title={this.props.title || this.props.placeholder}
                                disabled={!this.props.edit}
                                value={this.state.isEditing ? this.state.value : this.props.value}
                                onChange={(newValue) => this.selectInputUpdated(newValue) }
                                onBlur={() => this.finishEditing()}
                                innerRef={(inputElem) => this.inputElem = inputElem}
                            /> : null
                    }
                    {
                        this.props.type === "tenancyType" ?
                            <TenancyTypeSelector
                                value={this.state.isEditing ? this.state.value : this.props.value}
                                title={this.props.title || this.props.placeholder}
                                disabled={!this.props.edit}
                                onChange={(newValue) => this.selectInputUpdated(newValue) }
                                onBlur={() => this.finishEditing()}
                                innerRef={(inputElem) => this.inputElem = inputElem}
                            /> : null
                    }
                    {
                        this.props.type === "tenantName" ?
                            <TenantNameSelector
                                value={this.state.isEditing ? this.state.value : this.props.value}
                                title={this.props.title || this.props.placeholder}
                                disabled={!this.props.edit}
                                onChange={(newValue) => this.tenantNameInputUpdated(newValue) }
                                onBlur={() => this.finishEditing()}
                                innerRef={(inputElem) => this.inputElem = inputElem}
                            /> : null
                    }
                    {
                        this.props.type === "tags" ?
                            <TagEditor
                                disabled={!this.props.edit}
                                propertyType={this.props.propertyType}
                                title={this.props.title || this.props.placeholder}
                                value={this.state.isEditing ? this.state.value : this.props.value}
                                onChange={(newValue) => this.tagInputUpdated(newValue) }
                                onBlur={() => this.finishEditing()}
                            /> : null
                    }
                    {
                        this.props.type === "address" ?
                            <Geosuggest
                                title={this.props.title || this.props.placeholder}
                                types={["geocode"]}
                                placeholder={this.props.placeholder}
                                disabled={!this.props.edit}
                                location={this.props.location}
                                radius={this.props.location ? 20 : 0}
                                initialValue={this.state.isEditing ? this.state.value : this.formatValue(this.props.value)}
                                onSuggestSelect={(newValue) => this.addressInputUpdated(newValue)}
                                inputClassName={"form-control"}
                                onBlur={(evt) => this.finishEditing()}
                            /> : null
                    }
                </InputGroup>
            </div>
        );

        if (this.props.connectDropTarget)
        {
            return this.props.connectDropTarget(rendered);
        }
        else
        {
            return rendered;
        }
    }
}

/**
 * Implement the drag source contract.
 */
const dragTarget = {
    drop: (props, monitor) => {
        if (props.type === 'currency' ||
            props.type === 'number' ||
            props.type === 'percent' ||
            props.type === 'length' ||
            props.type === 'area' ||
            props.type === 'acres' ||
            props.type === 'months' ||
            props.type === 'text'
        )
        {
            props.onChange(FieldDisplayEdit.cleanValue(props.type, monitor.getItem().word.word), [monitor.getItem().word.index])
        }
    }
};


function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
    }
}

// Export the wrapped component:
const DroppableFieldDisplayEdit = DropTarget("Word", dragTarget, collect)(FieldDisplayEdit);

const NonDroppableFieldDisplayEdit = FieldDisplayEdit;

const SwitchingFieldDisplayEdit = (props) =>
{
    const result = <DroppableFieldDisplayEdit {...props}/>;
    const elem = document.createElement("div");
    if (!ReactDOM.render(result, elem))
    {
        return <FieldDisplayEdit {...props}/>
    }
    return result;
}

export default SwitchingFieldDisplayEdit;
export {NonDroppableFieldDisplayEdit, DroppableFieldDisplayEdit};


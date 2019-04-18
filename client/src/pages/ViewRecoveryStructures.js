import React from 'react';
import { Row, Col, Card, CardHeader, CardBody, Button } from 'reactstrap';
import axios from "axios/index";
import FieldDisplayEdit from './components/FieldDisplayEdit';
import 'react-datetime/css/react-datetime.css'
import NumberFormat from "react-number-format";
import RecoveryStructureModel from "../models/RecoveryStructureModel";



class RecoveryStructureEditor extends React.Component
{
    changeRecoveryStructureField(field, newValue)
    {
        const recoveryStructure = this.props.recovery;

        if (field === "name")
        {
            // Go through the appraisal units and update any which are attached to this rent name
            this.props.appraisal.units.forEach((unit) =>
            {
                if (unit.recoveryStructure === recoveryStructure.name)
                {
                    unit.recoveryStructure = newValue;
                }
            });
        }

        if (newValue !== recoveryStructure[field])
        {
            recoveryStructure[field] = newValue;
            this.props.onChange(recoveryStructure);
        }
    }

    changeRecoveryRuleField(recoveryRule, field, newValue)
    {
        if (newValue !== recoveryRule[field])
        {
            recoveryRule[field] = newValue;
            this.props.onChange(this.props.recovery);
        }
    }

    deleteRecoveryRule(ruleIndex)
    {
        const recoveryStructure = this.props.recovery;

        recoveryStructure.expenseRecoveryRules.splice(ruleIndex, 1);

        this.props.onChange(recoveryStructure);
    }

    newExpenseRecoveryRule(field, newValue)
    {
        if (!newValue)
        {
            return
        }

        const recoveryStructure = this.props.recovery;

        const newRule = {
            percentage: 100,
            field: "operatingExpenses"
        };

        if (field !== null)
        {
            newRule[field] = newValue;
        }

        recoveryStructure.expenseRecoveryRules.push(newRule);

        this.props.onChange(recoveryStructure);
    }

    render()
    {
        const recovery = this.props.recovery;

        return <Card className={"recovery-structure-editor"}>
            <CardBody>
                <table className="recovery-structure-table">
                    <tbody>
                    <tr>
                        <td colSpan={2}>
                            <FieldDisplayEdit
                                type="text"
                                placeholder="Recovery Structure Name"
                                value={recovery.name}
                                onChange={(newValue) => this.changeRecoveryStructureField('name', newValue)}
                                hideInput={false}
                                hideIcon={true}

                            />
                        </td>
                        <td />
                    </tr>
                    <tr className={"recovery-rule"}>
                        <td className={"label-column"}>
                            <strong>Base Recovery on Size of Unit / Building Size?</strong>
                        </td>
                        <td className={"rule-description-column"}>
                            <FieldDisplayEdit
                                type="boolean"
                                value={recovery.baseOnUnitSize}
                                hideInput={false}
                                hideIcon={true}
                                onChange={(newValue) => this.changeRecoveryStructureField('baseOnUnitSize', newValue)}
                            />
                        </td>
                        <td />
                    </tr>
                    <tr className={"recovery-rule"}>
                        <td className={"label-column"}>
                            <strong>Management Recoveries</strong>
                        </td>
                        <td className={"rule-description-column"}>
                            {
                                !recovery.baseOnUnitSize ?
                                    [
                                        <FieldDisplayEdit
                                            key={1}
                                            type="percent"
                                                          placeholder={"Management Expense %"}
                                                          value={recovery.managementRecoveryRule.percentage}
                                                          hideInput={false}
                                                          hideIcon={true}
                                                          onChange={(newValue) => this.changeRecoveryRuleField(recovery.managementRecoveryRule, 'percentage', newValue)}
                                        />,
                                        <span key={2} className={"seperator"}>of</span>
                                    ]
                                    :
                                    <div className={"size-note"}>(% sqft) of</div>
                            }
                            <FieldDisplayEdit
                                type="managementRecoveryField"
                                placeholder={"Expense Calculation Field"}
                                value={recovery.managementRecoveryRule.field}
                                hideInput={false}
                                hideIcon={true}
                                onChange={(newValue) => this.changeRecoveryRuleField(recovery.managementRecoveryRule, 'field', newValue)}
                            />
                        </td>
                        <td />
                    </tr>
                    <tr className={"recovery-rule"}>
                        <td className={"label-column"}>
                            <strong>Operating Expense Recoveries</strong>
                        </td>
                        {
                            recovery.expenseRecoveryRules.length > 0 ?
                                    <td className={"rule-description-column"}>
                                        {
                                            !recovery.baseOnUnitSize ?
                                                [
                                                    <FieldDisplayEdit
                                                        key={1}
                                                        type="percent"
                                                        placeholder={"Expense %"}
                                                        value={recovery.expenseRecoveryRules[0].percentage}
                                                        hideInput={false}
                                                        hideIcon={true}
                                                        onChange={(newValue) => this.changeRecoveryRuleField(recovery.expenseRecoveryRules[0], 'percentage', newValue)}
                                                    />,
                                                    <span key={2} className={"seperator"}>of</span>
                                                ]
                                                : <div className={"size-note"}>(% sqft) of</div>
                                        }
                                        <FieldDisplayEdit
                                            type="managementRecoveryField"
                                            placeholder={"Calculated On"}
                                            value={recovery.expenseRecoveryRules[0].field}
                                            hideInput={false}
                                            hideIcon={true}
                                            onChange={(newValue) => this.changeRecoveryRuleField(recovery.expenseRecoveryRules[0], 'field', newValue)}
                                        />
                                    </td>
                                : <td />
                        }
                        {
                            recovery.expenseRecoveryRules.length > 0 ?
                                <td>
                                    <Button color={"secondary"} onClick={() => this.deleteRecoveryRule(0)}>
                                        <i className={"fa fa-trash-alt"}/>
                                    </Button>
                                </td> : null
                        }
                    </tr>
                    {
                        recovery.expenseRecoveryRules.map((rule, ruleIndex) => {
                            if (ruleIndex === 0)
                            {
                                return null;
                            }

                            return <tr key={ruleIndex} className={"recovery-rule"}>
                                <td className={"label-column"}>
                                </td>
                                <td className={"rule-description-column"}>

                                    {
                                        !recovery.baseOnUnitSize ?
                                            [
                                                <FieldDisplayEdit
                                                    key={1}
                                                    type="percent"
                                                    placeholder={"Expense %"}
                                                    value={rule.percentage}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                    onChange={(newValue) => this.changeRecoveryRuleField(rule, 'percentage', newValue)}
                                                />,
                                                <span key={2} className={"seperator"}>of</span>
                                            ]
                                            : <div className={"size-note"}>(% sqft) of</div>
                                    }

                                    <FieldDisplayEdit
                                        type="managementRecoveryField"
                                        placeholder={"Calculated On"}
                                        value={rule.field}
                                        hideInput={false}
                                        hideIcon={true}
                                        onChange={(newValue) => this.changeRecoveryRuleField(rule, 'field', newValue)}
                                    />
                                </td>
                                <td>
                                    <Button color={"secondary"} onClick={() => this.deleteRecoveryRule(ruleIndex)}>
                                        <i className={"fa fa-trash-alt"} />
                                    </Button>
                                </td>
                            </tr>
                        }).concat([
                            <tr key={recovery.expenseRecoveryRules.length + 1} className={"recovery-rule"}>
                                <td className={"label-column"}>
                                </td>
                                <td className={"rule-description-column"}>
                                    {
                                        !recovery.baseOnUnitSize ?
                                            [
                                                <FieldDisplayEdit
                                                    key={1}
                                                    type="percent"
                                                    placeholder={"Add Expense Recovery"}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                    onChange={(newValue) => this.newExpenseRecoveryRule('percentage', newValue)}
                                                />,
                                                <span key={2} className = {"seperator"} > of </span>
                                            ] : <div className={"size-note"}>(% sqft) of</div>
                                    }
                                    <FieldDisplayEdit
                                        type="managementRecoveryField"
                                        placeholder={"Calculated On"}
                                        hideInput={false}
                                        hideIcon={true}
                                        onChange={(newValue) => this.newExpenseRecoveryRule('field', newValue)}
                                    />
                                </td>
                                <td>
                                    <Button color={"secondary"} onClick={() => this.newExpenseRecoveryRule("percentage", 100)}>
                                        <i className={"fa fa-plus"} />
                                    </Button>
                                </td>
                            </tr>
                        ])
                    }
                    </tbody>
                </table>


                <Button color={"danger"} className={"delete-button"} onClick={() => this.props.onDeleteRecovery(this.props.recovery)}>Delete</Button>
            </CardBody>
        </Card>
    }
}

class ViewRecoveryStructures extends React.Component
{
    state = {
        capitalizationRate: 8.4,
        selectedUnit: null,
        comparableLeases: []
    };

    defaultRecoveryStructureData = {
        name: "",
        baseOnUnitSize: true,
        managementRecoveryRule: {
            percentage: 100,
            field: "managementExpenses"
        },
        expenseRecoveryRules: [{
            percentage: 100,
            field: "operatingExpenses"
        }]
    };

    componentDidMount()
    {

    }

    onRecoveryChanged(recovery, recoveryIndex)
    {
        this.props.appraisal.recoveryStructures[recoveryIndex] = recovery;
        this.props.saveAppraisal(this.props.appraisal);
    }

    onNewRecovery(newRecovery)
    {
        this.props.appraisal.recoveryStructures.push(newRecovery);
        this.props.saveAppraisal(this.props.appraisal);
    }

    onDeleteRecovery(recoveryIndex)
    {
        this.props.appraisal.recoveryStructures.splice(recoveryIndex, 1);
        this.props.saveAppraisal(this.props.appraisal);
    }

    render() {
        return (
            (this.props.appraisal) ?
                <div id={"view-recovery-structures"} className={"view-recovery-structures"}>
                    <h2>Recovery Structures</h2>

                    <Row>
                        <Col>
                            <div className={"recovery-structures-list"}>
                            {
                                this.props.appraisal.recoveryStructures.map((recovery, recoveryIndex) =>
                                {
                                    return <RecoveryStructureEditor
                                        recovery={recovery}
                                        appraisal={this.props.appraisal}
                                        onChange={(newValue) => this.onRecoveryChanged(newValue, recoveryIndex)}
                                        onDeleteRecovery={() => this.onDeleteRecovery(recoveryIndex)}
                                    />
                                })
                            }
                            {
                                <div className={"new-recovery-structure"}>
                                        <Button onClick={() => this.onNewRecovery(new RecoveryStructureModel(this.defaultRecoveryStructureData))}>
                                        <span>Create a new recovery structure</span>
                                        </Button>
                                </div>
                            }
                            </div>
                        </Col>
                    </Row>
                </div>
                : null
        );
    }
}

export default ViewRecoveryStructures;

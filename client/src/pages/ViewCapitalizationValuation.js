import React from 'react';
import {Row, Col, Card, CardBody, CardHeader, Table, Button} from 'reactstrap';
import NumberFormat from 'react-number-format';
import axios from "axios/index";
import AnnotationUtilities from './AnnotationUtilities';
import FieldDisplayEdit from './components/FieldDisplayEdit';
import _ from 'underscore';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import ComparableSaleList from "./components/ComparableSaleList";
import ComparableSaleModel from "../models/ComparableSaleModel";
import Promise from "bluebird";

class ViewCapitalizationValuation extends React.Component
{
    state = {
        capitalizationRate: 8.4,
        comparableSales: []
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
                        this.loadedComparables[comparableSaleId] = new ComparableSaleModel(response.data.comparableSale);
                        return this.loadedComparables[comparableSaleId];
                    }
                });
            }
        }).then((comparableSales) =>
        {
            this.setState({comparableSales: comparableSales.filter((item) => item)})
        }).catch((err) =>
        {
            alert("Error: " + err.toString());
        })
    }


    changeStabilizedInput(field, newValue)
    {
        this.props.appraisal.stabilizedStatementInputs[field] = newValue;
        this.props.saveDocument(this.props.appraisal, true);
    }


    render()
    {
        return [
            <AppraisalContentHeader appraisal={this.props.appraisal} title="Capitalization Valuation"/>,
            <Row className={"view-capitalization-valuation"}>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>
                            <div className={"stabilized-statement-centered"}>
                                <h3>Capitalization Valuation</h3>
                                <h4>{this.props.appraisal.address}</h4>
                                <ComparableSaleList comparableSales={this.state.comparableSales}
                                                    statsTitle={""}
                                                    statsPosition={"below"}
                                                    showPropertyTypeInHeader={false}
                                                    allowNew={false}
                                                    history={this.props.history}
                                                    appraisal={this.props.appraisal}
                                                    appraisalId={this.props.match.params._id}
                                                    appraisalComparables={this.props.appraisal.comparableSales}
                                                    // onRemoveComparableClicked={(comp) => this.removeComparableFromAppraisal(comp)}
                                                    // onChange={(comps) => this.onComparablesChanged(comps)}
                                />

                                <Table className={"statement-table "}>
                                    <tbody>
                                    <tr className={"title-row"}>
                                        <td className={"label-column"}><span className={"title"}>Net Operating Income</span></td>
                                        <td className={"amount-column"} />
                                        <td className={"amount-total-column"}>
                                            $<NumberFormat
                                            value={this.props.appraisal.stabilizedStatement.netOperatingIncome}
                                            displayType={'text'}
                                            thousandSeparator={', '}
                                            decimalScale={2}
                                            fixedDecimalScale={true}
                                        />
                                        </td>
                                    </tr>
                                    {/*<tr className={"data-row"}>*/}
                                    {/*<td className={"label-column"}>NOI per square foot</td>*/}
                                    {/*<td className={"amount-column"}></td>*/}
                                    {/*<td className={"amount-total-column"}>todo</td>*/}
                                    {/*</tr>*/}
                                    <tr className={"data-row capitalization-row"}>
                                        <td className={"label-column"}>
                                            <span>Capitalized @</span>
                                            <FieldDisplayEdit
                                                type={"percent"}
                                                placeholder={"Capitalization Rate"}
                                                value={this.props.appraisal.stabilizedStatementInputs ? this.props.appraisal.stabilizedStatementInputs.capitalizationRate : 5.0}
                                                onChange={(newValue) => this.changeStabilizedInput("capitalizationRate", newValue)}
                                            />
                                        </td>
                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}>
                                            $<NumberFormat
                                            value={this.props.appraisal.stabilizedStatement.valuation}
                                            displayType={'text'}
                                            thousandSeparator={', '}
                                            decimalScale={2}
                                            fixedDecimalScale={true}
                                        />
                                        </td>
                                    </tr>
                                    <tr className={"data-row rounding-row"}>
                                        <td className={"label-column"}>
                                            <span>Rounded</span>
                                        </td>
                                        <td className={"amount-column"}></td>
                                        <td className={"amount-total-column"}>
                                            $<NumberFormat
                                            value={this.props.appraisal.stabilizedStatement.valuationRounded}
                                            displayType={'text'}
                                            thousandSeparator={', '}
                                            decimalScale={2}
                                            fixedDecimalScale={true}
                                        />
                                        </td>
                                    </tr>
                                    </tbody>
                                </Table>
                                <br/>
                                <br/>
                                <h4 className={"final-valuation"}>Value by the Income Approach ... $<NumberFormat
                                    value={this.props.appraisal.stabilizedStatement.valuationRounded}
                                    displayType={'text'}
                                    thousandSeparator={', '}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                />
                                </h4>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        ];
    }
}

export default ViewCapitalizationValuation;

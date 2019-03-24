import React from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import axios from 'axios';
import ComparableSaleList from "./components/ComparableSaleList"


class ViewComparableSales extends React.Component {
    state = {
        comparableSales: []
    };

    componentDidMount() {
        axios.get(`/comparable_sales`).then((response) => {
            this.setState({comparableSales: response.data.comparableSales})
        });
    }

    onComparablesChanged(newComparables)
    {
        this.setState({comparableSales: newComparables});
    }



    render() {
        return (
            <Row>
                <Col xs={6}>
                    <Card className="card-default">
                        <CardBody>
                            <div>
                                <Row>
                                    <Col xs={11}>
                                        <h3>View Comparable Sales</h3>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12}>
                                        <ComparableSaleList comparableSales={this.state.comparableSales}
                                                            history={this.props.history}
                                                            appraisalId={this.props.match.params._id}
                                                            onChange={(comps) => this.onComparablesChanged(comps)}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col xs={6}>
                    <Card className="card-default">
                        <CardBody>
                            <div>
                                <Row>
                                    <Col xs={12}>
                                        <h3>Add A Comparable</h3>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12}>
                                        <form action="">
                                            <div className="input-group input-group-lg">
                                                <input className="form-control form-control-lg rounded-0" type="text" name="term" placeholder="Search"/>
                                                {/*<select className="form-control form-control-lg">*/}
                                                {/*<option>All Products</option>*/}
                                                {/*<option>Templates</option>*/}
                                                {/*<option>Servers</option>*/}
                                                {/*<option>Billing</option>*/}
                                                {/*<option>Buyers</option>*/}
                                                {/*<option>Sellers</option>*/}
                                                {/*<option>Plans</option>*/}
                                                {/*<option>Accounts</option>*/}
                                                {/*</select>*/}
                                                {/*<div className="input-group-append">*/}
                                                {/*<button className="btn btn-info btn-lg b0 rounded-0" type="button">*/}
                                                {/*<strong>Search</strong>*/}
                                                {/*</button>*/}
                                                {/*</div>*/}
                                                <br />
                                            </div>
                                        </form>
                                    </Col>
                                </Row>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        );
    }
}

export default ViewComparableSales;

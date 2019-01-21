import React from 'react';
import { Row, Col, Card, CardBody,  Nav, NavItem, NavLink } from 'reactstrap';
import axios from 'axios';
import ViewComparableSaleExtractions from "./ViewComparableSaleExtractions";
import { NavLink as RRNavLink } from 'react-router-dom';
import { Switch, Route } from 'react-router-dom';


class ViewComparableSale extends React.Component
{
    state = {
        width: 0,
        height: 0
    };

    componentDidMount()
    {
        axios.get(`/appraisal/${this.props.match.params.id}/comparable_sales/${this.props.match.params.comparableSaleId}`).then((response) =>
        {
            this.setState({comparableSale: response.data.comparableSale})
        });
    }

    componentDidUpdate()
    {

    }

    saveComparableSaleData(newLease)
    {
        axios.post(`/appraisal/${this.props.match.params.id}/comparable_sales/${this.props.match.params.comparableSaleId}`, newLease).then((response) =>
        {
            this.setState({comparableSale: newLease})
        });
    }

    render() {
        return (
            <div id={"view-lease-page"}>
                <Row>
                    <Col xs={12}>
                        <Nav tabs>
                            <NavItem>
                                <NavLink to={`${this.props.match.url}/raw`} activeClassName="active" tag={RRNavLink}>Raw Comparable Sale Info</NavLink>
                            </NavItem>
                        </Nav>
                    </Col>
                </Row>
                {
                    (this.state.comparableSale && <Row>
                        <Col xs={12} className={"content-column"}>
                            <Card className="card-default">
                                <CardBody>
                                    <Switch>
                                        <Route path={`${this.props.match.url}/raw`} render={() => <ViewComparableSaleExtractions comparableSale={this.state.comparableSale} saveComparableSaleData={this.saveComparableSaleData.bind(this)}/>} comparableSale={this.state.comparableSale} />
                                    </Switch>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>)
                }
            </div>
        );
    }
}

export default ViewComparableSale;

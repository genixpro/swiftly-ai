import React from 'react';
import { translate, Trans } from 'react-i18next';
import ContentWrapper from '../components/Layout/ContentWrapper';
import { Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Card, CardBody, CardHeader, FormGroup, Input } from 'reactstrap';
import axios from 'axios';
import {QueryRenderer} from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import environment from '../environment';

class ViewAllAppraisals extends React.Component {

    state = {
    };


    componentDidMount()
    {

    }

    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    <div>View All Appraisals</div>
                </div>
                <Row>
                    <div className="col-md-6">
                        <QueryRenderer
                            environment={environment}
                            query={graphql`
                              query ViewAllAppraisalsQuery {
                                appraisals {
                                  id
                                  name
                                }
                              }
                            `}
                            variables={{}}
                            render={({error, props}) => {
                                if (error) {
                                    return <div>Error! {error.toString()}</div>;
                                }
                                if (!props) {
                                    return <div>Loading...</div>;
                                }
                                return props.appraisals.map((appraisal) =>
                                {
                                    return <div>Appraisal ID: {appraisal.id}</div>;
                                });
                            }}
                        />
                    </div>
                </Row>
            </ContentWrapper>
        );
    }
}

export default ViewAllAppraisals;

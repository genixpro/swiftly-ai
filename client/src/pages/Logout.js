import React from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import 'loaders.css/loaders.css';
import 'spinkit/css/spinkit.css';
import AppraisalContentHeader from "./components/AppraisalContentHeader";
import Auth from "../Auth";


class Logout extends React.Component
{
    componentDidMount()
    {
        if (window.confirm("Are you sure you want to logout?"))
        {
            Auth.logout();
        }
        else
        {
            setTimeout(() =>
            {
                this.props.history.push('/appraisals');
            }, 200);
        }
    }

    render() {
        return (
            <div className={"logout-page"}>
                <AppraisalContentHeader appraisal={this.props.appraisal} title="Log Out" />
                <Row>
                    <Col xs={12}>
                        <Card className="card-default">
                            <CardBody>
                                <div>
                                    <p>Logging Out...</p>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default Logout;

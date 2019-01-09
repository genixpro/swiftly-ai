import React from 'react';
import { translate, Trans } from 'react-i18next';
import ContentWrapper from '../components/Layout/ContentWrapper';
import { Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Card, CardBody, CardHeader, CardText, CardTitle, FormGroup, Input,  Nav, NavItem, NavLink } from 'reactstrap';
import axios from 'axios';
import ResizeObserver from 'resize-observer-polyfill';
import _ from 'underscore';
import UploadFiles from "./UploadFiles";
import ViewLeases from "./ViewLeases";
import { NavLink as RRNavLink } from 'react-router-dom';


class ViewLeaseExtractions extends React.Component
{
    state = {
        width: 0,
        height: 0,
        lease: {
            extractedData:{},
            words: []
        }
    };

    componentDidMount()
    {
        this.setState({"lease": this.props.lease});

        const canvasElement = document.getElementById("view-lease-canvas");
        const obj = new ResizeObserver((entries, observer) => {
            this.setState({canvasWidth: canvasElement.clientWidth, canvasHeight: canvasElement.clientHeight});
        });

        obj.observe(canvasElement);
    }

    updateCanvas()
    {
        const canvasElement = document.getElementById("view-lease-canvas");
        var ctx = canvasElement.getContext("2d");
        ctx.clearRect(0, 0, canvasElement.clientWidth, canvasElement.clientHeight);

        ctx.beginPath();//ADD THIS LINE!<<<<<<<<<<<<<
        let pageTop = 0;
        _.range(this.state.lease.pages).forEach((page) =>
        {
            const imageElement = document.getElementById(`view-lease-image-${page}`);
            const counterpartyFieldElement = document.getElementById(`counterparty-field`);
            this.state.lease.words.forEach((word) =>
            {
                if(word.page === page && word.classification === 'counterparty_name')
                {
                    const x = word.left * imageElement.clientWidth;
                    const y = word.top * imageElement.clientHeight;

                    const width = (word.right - word.left) * imageElement.clientWidth;
                    const height = (word.bottom - word.top) * imageElement.clientHeight;

                    // ctx.moveTo(x, y);
                    ctx.fillStyle = "#0000ff55";
                    ctx.fillRect(x, y + pageTop, width, height);

                    if(word.hover)
                    {
                        ctx.moveTo(x + width, y + height/2 + pageTop);
                        ctx.strokeStyle = "#0000ff55";
                        ctx.lineWidth = 3;
                        ctx.lineTo(counterpartyFieldElement.getBoundingClientRect().left - canvasElement.getBoundingClientRect().left, (counterpartyFieldElement.getBoundingClientRect().top - canvasElement.getBoundingClientRect().top + counterpartyFieldElement.getBoundingClientRect().height/2));
                    }


                }
            });
            pageTop += imageElement.clientHeight;
        });
        ctx.stroke();
    }

    componentDidUpdate()
    {
        const canvasElement = document.getElementById("view-lease-canvas");
        if(canvasElement.clientWidth !== this.state.canvasWidth || canvasElement.clientHeight !== this.state.canvasHeight)
        {
            this.setState({canvasWidth: canvasElement.clientWidth, canvasHeight: canvasElement.clientHeight});
        }

        if(this.state.lease.words)
        {
            this.updateCanvas();
        }
    }

    onWordHoverStart(wordIndex)
    {
        const word = this.state.lease.words[wordIndex];
        word.hover = true;
        this.setState({lease: this.state.lease});
    }

    onWordHoverEnd(wordIndex)
    {
        const word = this.state.lease.words[wordIndex];
        word.hover = false;
        this.setState({lease: this.state.lease});
    }

    render() {
        return (
            <div id={"view-lease-extractions"}>
                <canvas id="view-lease-canvas" className={"view-lease-canvas"} width={this.state.canvasWidth} height={this.state.canvasHeight} style={{"border":"1px solid #000000;"}} />
                <Row>
                    <Col xs={9}>
                        {
                            _.range(this.state.lease.pages).map((page) =>
                            {
                                return <div className={"lease-image-container"}>
                                    <img alt="Lease Image" id={`view-lease-image-${page}`} src={`https://appraisalfiles.blob.core.windows.net/files/${this.state.lease.fileId}-image-${page+1}.png`} onLoad={this.componentDidUpdate.bind(this)} className="leaseImage"/>
                                    {
                                        this.state.lease.words.map((word, wordIndex) =>
                                        {
                                            if(word.page === page)
                                            {
                                                return <div className={"view-lease-word"}
                                                            style={{"top": `${word.top*100}%`, "left": `${word.left*100}%`, "width": `${word.right*100 - word.left*100}%`, "height": `${word.bottom*100 - word.top*100}%`}}
                                                            onMouseEnter={this.onWordHoverStart.bind(this, wordIndex)}
                                                            onMouseLeave={this.onWordHoverEnd.bind(this, wordIndex)}
                                                >
                                                    <span>{word.word}</span>
                                                </div>
                                            }
                                        })
                                    }
                                </div>
                            })
                        }
                    </Col>
                    <Col xs={3}>
                        <Row>
                            <Col xs={12}>
                                <Card outline color="primary" className="mb-3">
                                    <CardHeader className="text-white bg-primary">Basic Information</CardHeader>
                                    <CardBody>
                                        <form onSubmit={this.onSubmit}>
                                            <FormGroup>
                                                <label>Counterparty</label>
                                                <Input type="text" placeholder="counterparty" id="counterparty-field" value={this.state.lease.extractedData.counterparty_name}/>
                                            </FormGroup>
                                        </form>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <Card outline color="primary" className="mb-3">
                                    <CardHeader className="text-white bg-primary">Financial Information</CardHeader>
                                    <CardBody>
                                        <form onSubmit={this.onSubmit}>
                                            <FormGroup>
                                                <label>Price per square Foot</label>
                                                <Input type="number" placeholder="PPS ($)"/>
                                            </FormGroup>
                                        </form>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ViewLeaseExtractions;

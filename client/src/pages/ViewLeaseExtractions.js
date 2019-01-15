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
import LeaseFields from './LeaseFields';
import { ContextMenu, MenuItem, ContextMenuTrigger, SubMenu } from "react-contextmenu";
import LeaseExtractionToken from './components/LeaseExtractionToken';


class ViewLeaseExtractions extends React.Component
{
    constructor()
    {
        super();
        this.state = {
            width: 0,
            height: 0,
            lease: {
                extractedData:{},
                words: []
            }
        };

        this.selecting = false;
        this.tokens = {};
        this.hoveredFields = [];
    }


    componentDidMount()
    {
        this.setState({"lease": this.props.lease});
        this.groupedByPage = _.groupBy(this.props.lease.words, (word) => word.page);

        const canvasElement = document.getElementById("view-lease-canvas");
        const obj = new ResizeObserver((entries, observer) => {
            this.setState({canvasWidth: canvasElement.clientWidth, canvasHeight: canvasElement.clientHeight}, () => {
                this.updateCanvas()
            });
        });

        obj.observe(canvasElement);
        this.scrollListener =_.debounce((evt) => this.onWindowScroll(evt), 500);
        window.addEventListener("scroll", this.scrollListener);
    }

    componentWillUnmount()
    {
        window.removeEventListener("scroll", this.scrollListener);
    }

    updateCanvas()
    {
        const canvasElement = document.getElementById("view-lease-canvas");
        var ctx = canvasElement.getContext("2d");
        ctx.clearRect(0, 0, canvasElement.clientWidth, canvasElement.clientHeight);

        ctx.beginPath();
        let pageTop = 0;

        _.range(this.state.lease.pages).forEach((page) =>
        {
            const imageElement = document.getElementById(`view-lease-image-${page}`);
            this.groupedByPage[page].forEach((word) =>
            {
                if(word.classification !== 'null')
                {
                    const x = word.left * imageElement.clientWidth;
                    const y = word.top * imageElement.clientHeight;

                    const width = (word.right - word.left) * imageElement.clientWidth;
                    const height = (word.bottom - word.top) * imageElement.clientHeight;

                    const fieldElement = document.getElementById(`${word.classification}-field`);

                    if(word.hover || this.hoveredFields.indexOf(word.classification) !== -1)
                    {
                        ctx.moveTo(x + width, y + height/2 + pageTop);
                        ctx.strokeStyle = "#0000ff55";
                        ctx.lineWidth = 3;
                        ctx.lineTo(fieldElement.getBoundingClientRect().left - canvasElement.getBoundingClientRect().left, (fieldElement.getBoundingClientRect().top - canvasElement.getBoundingClientRect().top + fieldElement.getBoundingClientRect().height/2));
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
    }

    onWindowScroll(evt)
    {
        const viewLeaseElement = document.getElementById("view-lease-side-menu");
        console.log(evt);
        console.log(viewLeaseElement.getBoundingClientRect().top);
        const menuTop = viewLeaseElement.getBoundingClientRect().top + evt.pageY;
        this.setState({menuScroll: Math.max(evt.pageY - menuTop + 20, 0)})
    }

    onWordMouseDown(wordIndex)
    {
        this.selecting = true;
        this.selectStart = wordIndex;

        const wordToken = this.tokens[wordIndex];
        wordToken.setState({selected: true});
    }

    onMouseUp()
    {
        this.selecting = false;
    }

    onClick(evt)
    {
        if (evt.button === 0)
        {
            Object.values(this.tokens).map((wordToken) =>
            {
                if (wordToken.state.selected)
                {
                    const word = wordToken.state.word;
                    wordToken.setState({selected: false});
                    this.updateCanvas();
                }
            });
            this.selecting = false;
        }
    }

    onWordHoverStart(wordIndex)
    {
        const word = this.state.lease.words[wordIndex];
        const wordToken = this.tokens[wordIndex];

        if (this.selecting)
        {
            Object.values(this.tokens).map((wordToken, wordTokenIndex) =>
            {
                const shouldSelect = (wordTokenIndex >= wordIndex && wordTokenIndex <= this.selectStart) || (wordTokenIndex >= this.selectStart && wordTokenIndex <= wordIndex);
                if (wordToken.state.selected && !shouldSelect)
                {
                    wordToken.setState({selected: false});
                }
                else if (!wordToken.state.selected && shouldSelect)
                {
                    wordToken.setState({selected: true});
                }
            });
        }

        word.hover = true;
        wordToken.setState({word: word});
        this.updateCanvas();
    }

    onWordHoverEnd(wordIndex)
    {
        const word = this.state.lease.words[wordIndex];
        const wordToken = this.tokens[wordIndex];

        word.hover = false;
        wordToken.setState({word: word});
        this.updateCanvas();
    }

    onFormHoverStart(field)
    {
        this.hoveredFields.push(field);
        this.updateCanvas();
    }

    onFormHoverEnd(field)
    {
        this.hoveredFields.splice(this.hoveredFields.indexOf(field), 1);
        this.updateCanvas();
    }

    changeWordClassification(evt, newClass)
    {
        evt.stopPropagation();

        Object.values(this.tokens).map((wordToken) =>
        {
            if (wordToken.state.selected)
            {
                const word = wordToken.state.word;
                word.classification = newClass;
                wordToken.setState({word: word, selected: false});
            }
        });
        this.updateCanvas();
    }

    render() {
        return (
            <div id={"view-lease-extractions"} onMouseUp={this.onMouseUp.bind(this)} onClick={this.onClick.bind(this)}>
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
                                                return <LeaseExtractionToken
                                                    word={word}
                                                    wordIndex={wordIndex}
                                                    ref={(component) => this.tokens[wordIndex] = component}
                                                    onWordHoverStart={this.onWordHoverStart.bind(this, wordIndex)}
                                                    onWordHoverEnd={this.onWordHoverEnd.bind(this, wordIndex)}
                                                    onWordMouseDown={this.onWordMouseDown.bind(this, wordIndex)}
                                                />
                                            }
                                        })
                                    }
                                </div>
                            })
                        }
                    </Col>
                        <Col xs={3} id="view-lease-side-menu">
                            <div style={{"margin-top": `${this.state.menuScroll}px`}}>
                                {
                                    LeaseFields.map((group) =>
                                    {
                                        return <Row>
                                            <Col xs={12}>
                                                <Card outline color="primary" className="mb-3">
                                                    <CardHeader className="text-white bg-primary">{group.name}</CardHeader>
                                                    <CardBody>
                                                        <form onSubmit={this.onSubmit}>
                                                            {group.fields.map((field) =>
                                                                <FormGroup
                                                                    className={"view-lease-form-field"}
                                                                    onMouseEnter={this.onFormHoverStart.bind(this, field.field)}
                                                                    onMouseLeave={this.onFormHoverEnd.bind(this, field.field)}
                                                                >
                                                                    <label className={"view-lease-form-field-title"}>{field.name}</label>
                                                                    <Input type="text" placeholder={field.placeholder} id={`${field.field}-field`} value={this.state.lease.extractedData[field.field]}/>
                                                                </FormGroup>)
                                                            }
                                                        </form>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                        </Row>;
                                    })
                                }
                            </div>
                        </Col>
                </Row>
                <ContextMenu id="view-lease-word-menu">
                    {
                        LeaseFields.map((group) => {
                            return <SubMenu title={group.name}>
                                {group.fields.map((field) => {
                                    return <MenuItem onClick={(evt, data) => this.changeWordClassification(evt, field.field)}>
                                        {field.name}
                                    </MenuItem>
                                })
                                }
                            </SubMenu>
                        })
                    }
                    <MenuItem onClick={(evt, data) => this.changeWordClassification(evt, "null")}>
                        Nothing
                    </MenuItem>
                </ContextMenu>
            </div>
        );
    }
}

export default ViewLeaseExtractions;

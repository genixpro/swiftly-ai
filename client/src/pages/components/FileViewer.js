import React from 'react';
import { Badge, Row, Col, Card, CardBody, CardHeader, FormGroup, Table } from 'reactstrap';
import ResizeObserver from 'resize-observer-polyfill';
import _ from 'underscore';
import { ContextMenu, MenuItem, SubMenu } from "react-contextmenu";
import AnnotationExtractionToken from './AnnotationExtractionToken';
import { Progress } from 'reactstrap';
import NumberFormat from 'react-number-format';


class FileViewer extends React.Component
{
    constructor()
    {
        super();
        this.state = {
            width: 0,
            height: 0,
            currentPage: 0,
            document: {
                _id: {},
                words: [],
                pageTypes: []
            },
            imageZoom: 100,
            hilightWords: [],
            innerScrollLeft: 0,
            innerScrollTop: 0
        };

        this.tokens = {};
    }

    static computeDefaultZoom(document)
    {
        let totalWordHeight = 0;
        let totalWordWidth = 0;
        document.words.forEach((word) =>
        {
            totalWordHeight += (word.bottom - word.top);
            totalWordWidth += (word.right - word.left);
        });

        const averageWordHeight = totalWordHeight / document.words.length;
        const averageWordWidth = totalWordWidth / document.words.length;

        const viewportHeight = window.innerHeight;

        const adjustedAverageWordHeight = averageWordWidth * (averageWordWidth / averageWordHeight) * viewportHeight;

        const zoomLevel = (40 / adjustedAverageWordHeight) * 100;
        return zoomLevel;
    }


    componentDidMount()
    {

    }

    componentWillUnmount()
    {

    }

    componentDidUpdate()
    {
        if (this.props.document._id['$oid'] !== this.documentId)
        {
            this.documentId = this.props.document._id['$oid'];
            this.setState({imageZoom: FileViewer.computeDefaultZoom(this.props.document)});
        }
    }

    onMouseUp()
    {
        this.selecting = false;
        this.isDraggingImage = false;
    }


    changePage(newPage)
    {
        this.setState({currentPage: newPage})
    }

    moveViewTo(imageX, imageY, containerX, containerY)
    {
        console.log(imageX, imageY, containerX, containerY);

        const imageContainer = document.getElementById("file-viewer-image-outer-container");
        const image = document.getElementById(`file-viewer-image`);


        this.setState({
            innerScrollLeft: imageX * image.getBoundingClientRect().width - imageContainer.getBoundingClientRect().width * containerX,
            innerScrollTop: imageY * image.getBoundingClientRect().height - imageContainer.getBoundingClientRect().height * containerY
        });

        // imageContainer.scroll({
        //     left: ,
        //     top:
        // })
    }


    zoomIn(evt)
    {
        const body = document.getElementById(`main-body`);
        const image = document.getElementById(`file-viewer-image`);
        const imageContainer = document.getElementById("file-viewer-image-outer-container");

        let containerX = null;
        let containerY = null;

        let imageX = null;
        let imageY = null;

        if (evt)
        {
            containerX = (evt.pageX - imageContainer.getBoundingClientRect().left - window.scrollX) / imageContainer.getBoundingClientRect().width;
            containerY = (evt.pageY - imageContainer.getBoundingClientRect().top - window.scrollY) / imageContainer.getBoundingClientRect().height;

            imageX = (evt.pageX - image.getBoundingClientRect().left - window.scrollX) / image.getBoundingClientRect().width;
            imageY = (evt.pageY - image.getBoundingClientRect().top - window.scrollY) / image.getBoundingClientRect().height;
        }
        else
        {
            containerX = 0.5;
            containerY = 0.5;

            imageX = (this.state.innerScrollLeft + imageContainer.getBoundingClientRect().width / 2) / image.getBoundingClientRect().width;
            imageY = (this.state.innerScrollTop + imageContainer.getBoundingClientRect().height / 2) / image.getBoundingClientRect().height;

        }

        const currentZoom = this.state.imageZoom;
        if (currentZoom < 150)
        {
            this.setState({imageZoom: currentZoom + 25}, () => this.moveViewTo(imageX, imageY, containerX, containerY));
        }
        else if(currentZoom < 250)
        {
            this.setState({imageZoom: currentZoom + 50}, () => this.moveViewTo(imageX, imageY, containerX, containerY));
        }
        else
        {
            this.setState({imageZoom: currentZoom + 100}, () => this.moveViewTo(imageX, imageY, containerX, containerY));
        }
    }


    zoomOut(evt)
    {
        const body = document.getElementById(`main-body`);
        const image = document.getElementById(`file-viewer-image`);
        const imageContainer = document.getElementById("file-viewer-image-outer-container");

        let containerX = null;
        let containerY = null;

        let imageX = null;
        let imageY = null;

        if (evt)
        {
            containerX = (evt.pageX - imageContainer.getBoundingClientRect().left - window.scrollX) / imageContainer.getBoundingClientRect().width;
            containerY = (evt.pageY - imageContainer.getBoundingClientRect().top - window.scrollY) / imageContainer.getBoundingClientRect().height;

            imageX = (evt.pageX - image.getBoundingClientRect().left - window.scrollX) / image.getBoundingClientRect().width;
            imageY = (evt.pageY - image.getBoundingClientRect().top - window.scrollY) / image.getBoundingClientRect().height;
        }
        else
        {
            containerX = 0.5;
            containerY = 0.5;

            imageX = (this.state.innerScrollLeft + imageContainer.getBoundingClientRect().width / 2) / image.getBoundingClientRect().width;
            imageY = (this.state.innerScrollTop + imageContainer.getBoundingClientRect().height / 2) / image.getBoundingClientRect().height;

        }

        const currentZoom = this.state.imageZoom;
        if (currentZoom > 250)
        {
            this.setState({imageZoom: Math.max(currentZoom - 100, 100)}, () => this.moveViewTo(imageX, imageY, containerX, containerY));
        }
        else if (currentZoom > 150)
        {
            this.setState({imageZoom: Math.max(currentZoom - 50, 100)}, () => this.moveViewTo(imageX, imageY, containerX, containerY));
        }
        else
        {
            this.setState({imageZoom: Math.max(currentZoom - 25, 100)}, () => this.moveViewTo(imageX, imageY, containerX, containerY));
        }

    }

    startImageDrag(evt)
    {
        const element = document.getElementById('file-viewer-image-outer-container');
        this.dragStartElementScrollX = this.state.innerScrollLeft;
        this.dragStartElementScrollY = this.state.innerScrollTop;

        this.dragStartX = evt.clientX;
        this.dragStartY = evt.clientY;
        this.isDraggingImage = true;
    }

    onMouseMove(evt)
    {
        if (this.isDraggingImage)
        {
            const element = document.getElementById('file-viewer-image-outer-container');
            const image = document.getElementById('file-viewer-image');

            this.setState({
                innerScrollLeft: Math.min(Math.max(-element.getBoundingClientRect().width*0.8, this.dragStartElementScrollX + this.dragStartX - evt.clientX), image.getBoundingClientRect().width * 0.8 ),
                innerScrollTop: Math.min(Math.max(-element.getBoundingClientRect().height*0.8, this.dragStartElementScrollY + this.dragStartY - evt.clientY), image.getBoundingClientRect().height * 0.8 )
            });
        }
    }

    hilightWords(words)
    {
        const imageContainer = document.getElementById("file-viewer-image-outer-container");
        const firstWord = this.props.document.words[words[0]];
        const newPage = firstWord.page;

        this.setState({hilightWords: words, currentPage: newPage}, () =>
        {
            this.moveViewTo(firstWord.left, firstWord.top, 0.5, 0.5);
        });
    }

    onWheel(evt)
    {
        if (evt.deltaY > 0)
        {
            this.zoomOut(evt);
        }
        else if (evt.deltaY < 0)
        {
            this.zoomIn(evt);
        }
        evt.preventDefault();
    }


    render() {
        return (
            <div id={"file-viewer"} className={"file-viewer"} onMouseUp={this.onMouseUp.bind(this)} onMouseMove={this.onMouseMove.bind(this)}>
                <Row>
                    <Col xs={2}>
                        {
                            _.range(this.props.document.pages).map((page) =>
                            {
                                return <Card outline color="primary" className={`file-viewer-thumbnail-container ${this.state.currentPage === page ? "selected-page" : ""}`} key={page}>
                                    <CardBody>
                                        <img
                                            alt="Document Preview"
                                            id={`file-viewer-image-${page}-thumbnail`}
                                            src={`https://appraisalfiles.blob.core.windows.net/files/${this.props.document._id['$oid']}-image-${page}.png`}
                                            onClick={() => this.changePage(page)}
                                            className={`file-viewer-image-thumbnail`}
                                        />
                                    </CardBody>
                                </Card>;
                            })
                        }
                    </Col>
                    <Col xs={10}>
                        <div className={"extractions-toolbar"}>
                            <div>
                                <em className="fa-2x icon-magnifier-add mr-2" onClick={() => this.zoomIn()}></em>
                            </div>
                            <div>
                                <em className="fa-2x icon-magnifier-remove mr-2" onClick={() => this.zoomOut()}></em>
                            </div>
                        </div>
                        <div className={"file-viewer-image-outer-container"}
                             id={"file-viewer-image-outer-container"}
                             onWheel={this.onWheel.bind(this)}
                             onMouseDown={this.startImageDrag.bind(this)}
                        >
                            <div className={"file-viewer-image-inner-container"}
                                 id={"file-viewer-image-inner-container"}
                                 style={{
                                     "width": `${this.state.imageZoom}%`,
                                     "left": -this.state.innerScrollLeft,
                                     "top": -this.state.innerScrollTop,
                                 }}
                            >
                                <img
                                    alt="Document"
                                    id={`file-viewer-image`}
                                    src={`https://appraisalfiles.blob.core.windows.net/files/${this.props.document._id['$oid']}-image-${this.state.currentPage}.png`}
                                    onLoad={this.componentDidUpdate.bind(this)}
                                    className="file-viewer-image"
                                />
                                {
                                    this.props.document.words.map((word, wordIndex) =>
                                    {
                                        if(word.page === this.state.currentPage)
                                        {
                                            return <div className={`file-viewer-word ${this.state.hilightWords.indexOf(wordIndex) !== -1 ? "classified" : "null"}`}
                                                 style={{"top": `${word.top*100}%`, "left": `${word.left*100}%`, "width": `${word.right*100 - word.left*100}%`, "height": `${word.bottom*100 - word.top*100}%`}}
                                            />
                                        }
                                        else
                                        {
                                            return null;
                                        }
                                    })
                                }
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default FileViewer;

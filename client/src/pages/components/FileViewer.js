import React from 'react';
import { Row, Col } from 'reactstrap';
import _ from 'underscore';
import { DragSource } from 'react-dnd'
import Auth from "../../Auth";

/**
 * Your Component
 */
function Word({ isDragging, dragSource, word, wordIndex, hilightWords }) {
    return dragSource(<div key={wordIndex}
         className={`file-viewer-word ${hilightWords.indexOf(wordIndex) !== -1 ? "classified" : "null"} ${isDragging ? "dragging" : "null"}`}
         style={{"top": `${word.top*100}%`, "left": `${word.left*100}%`, "width": `${word.right*100 - word.left*100}%`, "height": `${word.bottom*100 - word.top*100}%`}}
     />)
}
/**
 * Implement the drag source contract.
 */
const dragSource = {
    beginDrag: props => ({ word: props.word, wordText: props.wordText }),
};

/**
 * Specifies the props to inject into your component.
 */
function collect(connect, monitor) {
    return {
        dragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
    }
}

// Export the wrapped component:
const DraggableWord = DragSource("Word", dragSource, collect)(Word);

class FileViewer extends React.Component
{
    constructor()
    {
        super();
        this.state = {
            width: 0,
            height: 0,
            currentPage: 1,
            document: {
                _id: {},
                words: [],
                pageTypes: []
            },
            imageZoom: 100,
            previewError: false,
            hilightWords: [],
            innerScrollLeft: 0,
            innerScrollTop: 0
        };

        this.tokens = {};
    }

    static computeDefaultZoom(document)
    {
        const positionedWords = (document.words || []).filter((word) =>
            Number.isFinite(word.top) && Number.isFinite(word.bottom) &&
            Number.isFinite(word.left) && Number.isFinite(word.right)
        );
        // Scanned PDFs can be perfectly reviewable from rendered page images
        // while containing no OCR geometry at all.
        if (!positionedWords.length)
        {
            return 100;
        }
        let totalWordHeight = 0;
        let totalWordWidth = 0;
        positionedWords.forEach((word) =>
        {
            totalWordHeight += (word.bottom - word.top);
            totalWordWidth += (word.right - word.left);
        });

        const averageWordHeight = totalWordHeight / positionedWords.length;
        const averageWordWidth = totalWordWidth / positionedWords.length;

        const viewportHeight = window.innerHeight;

        const adjustedAverageWordHeight = averageWordWidth * (averageWordWidth / averageWordHeight) * viewportHeight;

        const zoomLevel = (40 / adjustedAverageWordHeight) * 100;
        return Number.isFinite(zoomLevel) ? Math.max(zoomLevel, 75) : 100;
    }


    componentDidMount()
    {
        this.componentDidUpdate();
    }

    componentWillUnmount()
    {

    }

    componentDidUpdate()
    {
        if (this.props.document._id !== this.documentId)
        {
            this.documentId = this.props.document._id;
            this.setState({
                currentPage: this.props.defaultPage || 1,
                imageZoom: FileViewer.computeDefaultZoom(this.props.document),
                previewError: false
            });
        }
    }

    onMouseUp()
    {
        this.selecting = false;
        this.isDraggingImage = false;
        if (this.isDraggingImage)
        {
            this.setState({isDraggingImage: false});
        }
    }


    changePage(evt)
    {
        const newPage = Number(evt.target.value);
        this.setState({currentPage: newPage})
    }

    moveViewTo(imageX, imageY, containerX, containerY, slowTransition)
    {
        const imageContainer = document.getElementById("file-viewer-image-outer-container");
        const image = document.getElementById(`file-viewer-image`);

        this.setState({
            slowTransition: (slowTransition ? true : false),
            innerScrollLeft: imageX * image.getBoundingClientRect().width - imageContainer.getBoundingClientRect().width * containerX,
            innerScrollTop: imageY * image.getBoundingClientRect().height - imageContainer.getBoundingClientRect().height * containerY
        }, () =>
        {
            setTimeout(() =>
            {
                this.setState({slowTransition: false});
            });
        });
    }


    zoomIn(evt)
    {
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
            this.setState({imageZoom: Math.max(currentZoom - 100, 75)}, () => this.moveViewTo(imageX, imageY, containerX, containerY));
        }
        else if (currentZoom > 150)
        {
            this.setState({imageZoom: Math.max(currentZoom - 50, 75)}, () => this.moveViewTo(imageX, imageY, containerX, containerY));
        }
        else
        {
            this.setState({imageZoom: Math.max(currentZoom - 25, 75)}, () => this.moveViewTo(imageX, imageY, containerX, containerY));
        }

    }

    startImageDrag(evt)
    {
        this.dragStartElementScrollX = this.state.innerScrollLeft;
        this.dragStartElementScrollY = this.state.innerScrollTop;

        this.dragStartX = evt.clientX;
        this.dragStartY = evt.clientY;
        this.setState({isDraggingImage: true});
        this.isDraggingImage = true;

        evt.preventDefault();
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
        const firstWord = this.props.document.words[words[0]];
        const newPage = firstWord.page;

        this.setState({hilightWords: words, currentPage: newPage});

        this.pageSelectRef.value = newPage;

        this.moveViewTo(firstWord.left, firstWord.top, 0.5, 0.5, true);
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
        const pageCount = Number(this.props.document.pages || 0);
        const previewAvailable = pageCount > 0 && !this.state.previewError;

        return (
            <div id={"file-viewer"} className={"file-viewer"} onMouseUp={this.onMouseUp.bind(this)} onMouseMove={this.onMouseMove.bind(this)}>
                <Row>
                    <Col xs={12}>
                        {pageCount > 0 ? <div className={"extractions-toolbar"}>
                            <div>
                                <select
                                        value={this.state.currentPage}
                                        ref={(ref) => this.pageSelectRef = ref}
                                        onChange={(evt) => this.changePage(evt)}
                                        aria-label="Preview page"
                                        className="custom-select">
                                    {
                                        _.range(1, pageCount + 1).map((page) =>
                                        {
                                            return <option key={page} value={page}>Page {page}</option>
                                        })
                                    }
                                </select>
                            </div>
                            <button type="button" className="viewer-toolbar-button icon-button" onClick={() => this.zoomIn()} aria-label="Zoom document preview in">
                                <em className="fa-2x icon-magnifier-add" aria-hidden="true"></em>
                            </button>
                            <button type="button" className="viewer-toolbar-button icon-button" onClick={() => this.zoomOut()} aria-label="Zoom document preview out">
                                <em className="fa-2x icon-magnifier-remove" aria-hidden="true"></em>
                            </button>
                        </div> : null}
                        <div className={"file-viewer-image-outer-container"}
                             id={"file-viewer-image-outer-container"}
                             onWheel={this.onWheel.bind(this)}
                        >
                            {previewAvailable ? <div className={"file-viewer-image-inner-container " + (this.state.slowTransition ? " slow-transition" : "")}
                                 id={"file-viewer-image-inner-container"}
                                 style={{
                                     "width": `${this.state.imageZoom}%`,
                                     "left": -this.state.innerScrollLeft,
                                     "top": -this.state.innerScrollTop,
                                 }}
                            >
                                <img
                                    alt={`Document preview, page ${this.state.currentPage}`}
                                    id={`file-viewer-image`}
                                    src={`${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.document.appraisalId}/files/${this.props.document._id}/rendered/${this.state.currentPage}?access_token=${Auth.getAccessToken()}`}
                                    className={`file-viewer-image frame active ${this.state.slowTransition ? "slow-transition" : ""}`}
                                    onError={() => this.setState({previewError: true})}
                                    onMouseDown={this.startImageDrag.bind(this)}
                                />
                                {
                                    this.props.document.words.map((word, wordIndex) =>
                                    {
                                        if(word.page === this.state.currentPage)
                                        {
                                            return <DraggableWord key={wordIndex} word={word} wordIndex={wordIndex} hilightWords={this.state.hilightWords} />
                                        }
                                        else
                                        {
                                            return null;
                                        }
                                    })
                                }
                            </div> : <div className="file-viewer-empty" role="status">
                                Document preview unavailable. This file has not been rendered yet.
                            </div>}
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default FileViewer;

import React from 'react';
import { Badge, Row, Col, Card, CardBody, CardHeader, FormGroup, Table } from 'reactstrap';
import ResizeObserver from 'resize-observer-polyfill';
import _ from 'underscore';
import { ContextMenu, MenuItem, SubMenu } from "react-contextmenu";
import AnnotationExtractionToken from './AnnotationExtractionToken';
import { Progress } from 'reactstrap';
import NumberFormat from 'react-number-format';


class AnnotationEditor extends React.Component
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
            extractedData:{}
        };

        this.selecting = false;
        this.tokens = {};
        this.hoveredFields = [];

        this.pageTypes = [
            "miscellaneous",
            "operating_statement",
            "rent_roll",
            "miscellaneous_financial"
        ];

        this.humanFriendlyPageType = {
            "miscellaneous": "Header / Footer / Miscellaneous",
            "operating_statement": "Operating Statement",
            "rent_roll": "Rent Rolls",
            "miscellaneous_financial": "Miscellaneous Financial"
        }
    }


    componentDidMount()
    {
        this.setState({"document": this.props.document}, () => this.updateExtractedData());
        this.groupedByPage = _.groupBy(this.props.document.words, (word) => word.page);

        const canvasElement = document.getElementById("annotation-editor-canvas");
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
        const canvasElement = document.getElementById("annotation-editor-canvas");
        var ctx = canvasElement.getContext("2d");
        ctx.clearRect(0, 0, canvasElement.clientWidth, canvasElement.clientHeight);

        ctx.beginPath();

        const page = this.state.currentPage;

        const imageElement = document.getElementById(`annotation-editor-image-${page}`);

        // Blank page with no words on it.
        if (!this.groupedByPage[page])
        {
            return;
        }

        this.groupedByPage[page].forEach((word) =>
        {
            if(word.classification !== 'null')
            {
                const fieldGroupInfo = this.getGroupInformation(word.classification);
                if (!fieldGroupInfo)
                {
                    return
                }

                const x = word.left * imageElement.clientWidth + (imageElement.getBoundingClientRect().left - canvasElement.getBoundingClientRect().left);
                const y = word.top * imageElement.clientHeight;

                const width = (word.right - word.left) * imageElement.clientWidth;
                const height = (word.bottom - word.top) * imageElement.clientHeight;

                let fieldElement = null;
                let hoverFieldName = null;
                if(fieldGroupInfo.multiple)
                {
                    fieldElement = document.getElementById(`${word.classification}-${word.page}-${word.lineNumber}-field`);
                    hoverFieldName = `${word.classification}-${word.page}-${word.lineNumber}`;
                }
                else
                {
                    fieldElement = document.getElementById(`${word.classification}-field`);
                    hoverFieldName = word.classification;
                }

                if((word.hover || this.hoveredFields.indexOf(hoverFieldName) !== -1) && fieldElement !== null)
                {
                    ctx.moveTo(x + width, y + height/2);
                    ctx.strokeStyle = "#0000ff55";
                    ctx.lineWidth = 3;
                    ctx.lineTo(fieldElement.getBoundingClientRect().left - canvasElement.getBoundingClientRect().left, (fieldElement.getBoundingClientRect().top - canvasElement.getBoundingClientRect().top + fieldElement.getBoundingClientRect().height/2));
                }
            }
        });
        ctx.stroke();
    }

    componentDidUpdate()
    {
        const canvasElement = document.getElementById("annotation-editor-canvas");
        if(canvasElement.clientWidth !== this.state.canvasWidth || canvasElement.clientHeight !== this.state.canvasHeight)
        {
            this.setState({canvasWidth: canvasElement.clientWidth, canvasHeight: canvasElement.clientHeight});
        }
    }

    onWindowScroll(evt)
    {
        const viewDocumentElement = document.getElementById("annotation-editor-side-menu");
        if (viewDocumentElement)
        {
            const menuTop = viewDocumentElement.getBoundingClientRect().top + evt.pageY;
            this.setState({menuScroll: Math.max(evt.pageY - menuTop + 20, 0)})
        }
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
        this.isDraggingImage = false;
    }

    onClick(evt)
    {
        if (evt.button === 0)
        {
            Object.values(this.tokens).forEach((wordToken) =>
            {
                if (wordToken.state.selected)
                {
                    wordToken.setState({selected: false});
                    this.updateCanvas();
                }
            });
            this.selecting = false;
        }
    }

    onWordHoverStart(wordIndex)
    {
        const word = this.state.document.words[wordIndex];
        const wordToken = this.tokens[wordIndex];

        this.setState({selectedWord: word});

        if (this.selecting)
        {
            const startWord = this.state.document.words[this.selectStart];
            // const startWordToken = this.tokens[this.selectStart];

            const endWord = this.state.document.words[wordIndex];
            // const endWordToken = this.tokens[wordIndex];

            const selectTop = Math.min(startWord.top, endWord.top);
            const selectBottom = Math.max(startWord.bottom, endWord.bottom);
            const selectLeft = Math.min(startWord.left, endWord.left);
            const selectRight = Math.max(startWord.right, endWord.right);


            Object.values(this.tokens).forEach((wordToken, wordTokenIndex) =>
            {
                const shouldSelectHorizontal = (wordToken.props.word.left <= selectRight) && (wordToken.props.word.right >= selectLeft);
                const shouldSelectVertical = (wordToken.props.word.top <= selectBottom) && (wordToken.props.word.bottom >= selectTop);

                const shouldSelect = shouldSelectHorizontal && shouldSelectVertical;

                // const shouldSelect = (wordTokenIndex >= wordIndex && wordTokenIndex <= this.selectStart) || (wordTokenIndex >= this.selectStart && wordTokenIndex <= wordIndex);
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
        const word = this.state.document.words[wordIndex];
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

    clearWordClassification(evt)
    {
        evt.stopPropagation();

        Object.values(this.tokens).forEach((wordToken) =>
        {
            if (wordToken.state.selected)
            {
                const word = wordToken.state.word;
                word.classification = "null";
                word.modifiers = [];
                wordToken.setState({word: word, selected: false});
            }
        });
        this.updateExtractedData();
        this.updateCanvas();
    }

    changeWordClassification(evt, newClass)
    {
        evt.stopPropagation();

        Object.values(this.tokens).forEach((wordToken) =>
        {
            if (wordToken.state.selected)
            {
                const word = wordToken.state.word;
                word.classification = newClass;
                wordToken.setState({word: word, selected: false});
            }
        });
        this.updateExtractedData();
        this.updateCanvas();
    }


    addWordModifiers(evt, newModifier)
    {
        evt.stopPropagation();

        Object.values(this.tokens).forEach((wordToken) =>
        {
            if (wordToken.state.selected)
            {
                const word = wordToken.state.word;
                if (!word.modifiers)
                {
                    word.modifiers = [];
                }

                if (word.modifiers.indexOf(newModifier) === -1)
                {
                    word.modifiers.push(newModifier);
                }

                wordToken.setState({word: word, selected: false});
            }
        });
        this.updateExtractedData();
        this.updateCanvas();
    }


    removeWordModifiers(evt, newModifier)
    {
        evt.stopPropagation();

        Object.values(this.tokens).forEach((wordToken) =>
        {
            if (wordToken.state.selected)
            {
                const word = wordToken.state.word;
                if (!word.modifiers)
                {
                    word.modifiers = [];
                }

                if (word.modifiers.indexOf(newModifier) !== -1)
                {
                    word.modifiers.splice(word.modifiers.indexOf(newModifier), 1);
                }

                wordToken.setState({word: word, selected: false});
            }
        });
        this.updateExtractedData();
        this.updateCanvas();
    }

    getFieldInformation(classification)
    {
        for (let group of this.props.annotationFields)
        {
            for (let field of group.fields)
            {
                if (field.field === classification)
                {
                    return field;
                }
            }
        }
        return null;
    }

    getGroupInformation(classification)
    {
        for (let group of this.props.annotationFields)
        {
            for (let field of group.fields)
            {
                if (field.field === classification)
                {
                    return group;
                }
            }
        }
        return null;
    }


    updateExtractedData()
    {
        const extractedData = {};

        const processWord = (word) =>
        {
            if(word.classification && word.classification !== 'null')
            {
                const groupInfo = this.getGroupInformation(word.classification);
                if (!groupInfo)
                {
                    // Don't do anything
                }
                else if (groupInfo.multiple)
                {
                    if(!extractedData[groupInfo.field])
                    {
                        extractedData[groupInfo.field] = {};
                    }

                    if(!extractedData[groupInfo.field][word.page + "-" + word.lineNumber])
                    {
                        extractedData[groupInfo.field][word.page + "-" + word.lineNumber] = {
                            lineNumber: word.page + "-" + word.lineNumber
                        };
                    }

                    if(!extractedData[groupInfo.field][word.page + "-" + word.lineNumber][word.classification])
                    {
                        extractedData[groupInfo.field][word.page + "-" + word.lineNumber][word.classification] = "";
                    }

                    extractedData[groupInfo.field][word.page + "-" + word.lineNumber][word.classification] += word.word + " "
                }
                else
                {
                    if(!extractedData[word.classification])
                    {
                        extractedData[word.classification] = "";
                    }
                    extractedData[word.classification] += word.word + " "
                }
            }
        };

        if (this.tokens.length > 0)
        {
            Object.values(this.tokens).forEach((wordToken) =>
            {
                processWord(wordToken.state.word);
            });
        }
        else
        {
            this.props.document.words.forEach((word) =>
            {
                processWord(word);
            });
        }

        this.props.annotationFields.forEach((groupInfo) =>
        {
            if (groupInfo.multiple)
            {
                if (extractedData[groupInfo.field])
                {
                    extractedData[groupInfo.field] = Object.values(extractedData[groupInfo.field]);
                }
                else
                {
                    extractedData[groupInfo.field] = [];
                }
            }
        });

        this.setState({extractedData: extractedData});
    }

    saveDocument()
    {
        this.props.saveDocument(this.state.document);
    }


    changePage(newPage)
    {
        this.setState({currentPage: newPage})
    }


    zoomIn()
    {
        const currentZoom = this.state.imageZoom;
        if (currentZoom < 150)
        {
            this.setState({imageZoom: currentZoom + 25});
        }
        else if(currentZoom < 250)
        {
            this.setState({imageZoom: currentZoom + 50});
        }
        else
        {
            this.setState({imageZoom: currentZoom + 100});
        }
    }


    zoomOut()
    {
        const currentZoom = this.state.imageZoom;
        if (currentZoom > 250)
        {
            this.setState({imageZoom: Math.max(currentZoom - 100, 100)});
        }
        else if (currentZoom > 150)
        {
            this.setState({imageZoom: Math.max(currentZoom - 50, 100)});
        }
        else
        {
            this.setState({imageZoom: Math.max(currentZoom - 25, 100)});
        }

    }

    startImageDrag(evt)
    {
        const element = document.getElementById('annotation-editor-image-outer-container');
        this.dragStartElementScrollX = element.scrollLeft;
        this.dragStartElementScrollY = element.scrollTop;

        this.dragStartX = evt.clientX;
        this.dragStartY = evt.clientY;
        this.isDraggingImage = true;
    }

    onMouseMove(evt)
    {
        if (this.isDraggingImage)
        {
            const element = document.getElementById('annotation-editor-image-outer-container');
            element.scrollLeft = Math.max(0, this.dragStartElementScrollX + this.dragStartX - evt.clientX);
            console.log(evt.clientX - this.dragStartX)
        }
    }

    onPageTypeChanged(page, newPageType)
    {
        const document = this.state.document;
        document.pageTypes[page] = newPageType;
        this.setState({document: document}, () => this.saveDocument());
    }


    render() {
        return (
            <div id={"annotation-editor-extractions"} onMouseUp={this.onMouseUp.bind(this)} onClick={this.onClick.bind(this)} onMouseMove={this.onMouseMove.bind(this)}>
                <Row>
                    <Col xs={2}>
                        {
                            _.range(this.state.document.pages).map((page) =>
                            {
                                return <Card outline color="primary" className="annotation-editor-thumbnail-container" key={page}>
                                    <CardBody>
                                        <img
                                            alt="Document Preview"
                                            id={`annotation-editor-image-${page}-thumbnail`}
                                            src={`https://appraisalfiles.blob.core.windows.net/files/${this.state.document._id}-image-${page}.png`}
                                            onLoad={this.componentDidUpdate.bind(this)}
                                            onClick={() => this.changePage(page)}
                                            className="annotationEditorImageThumbnail"
                                        />

                                        <select className="custom-select" value={this.state.document.pageTypes[page]} onChange={(evt) => this.onPageTypeChanged(page, evt.target.value)}>
                                            {
                                                this.pageTypes.map((pageType) => <option value={pageType}>{this.humanFriendlyPageType[pageType]}</option>)
                                            }
                                        </select>

                                        {/*<span>{this.humanFriendlyPageType[this.state.document.pageTypes[page]]}</span>*/}
                                    </CardBody>
                                </Card>;
                            })
                        }
                    </Col>
                    <Col xs={7}>
                        <canvas id="annotation-editor-canvas" className={"annotation-editor-canvas"} width={this.state.canvasWidth} height={this.state.canvasHeight} />
                        <div className={"extractions-toolbar"}>
                            <div className={"toolbar-label"}>
                                <span>Page Type</span>
                            </div>
                            <div>
                                <select className="custom-select" value={this.state.document.pageTypes[this.state.currentPage]} onChange={(evt) => this.onPageTypeChanged(this.state.currentPage, evt.target.value)}>
                                    {
                                        this.pageTypes.map((pageType) => <option value={pageType}>{this.humanFriendlyPageType[pageType]}</option>)
                                    }
                                </select>
                            </div>
                            <div>
                                <em className="fa-2x icon-magnifier-add mr-2" onClick={() => this.zoomIn()}></em>
                            </div>
                            <div>
                                <em className="fa-2x icon-magnifier-remove mr-2" onClick={() => this.zoomOut()}></em>
                            </div>
                        </div>
                        <div className={"annotation-editor-image-outer-container"}
                             id={"annotation-editor-image-outer-container"}>
                            <div className={"annotation-editor-image-inner-container"}
                                 id={"annotation-editor-image-inner-container"}
                                 style={{"width": `${this.state.imageZoom}%`}}
                                 onMouseDown={this.startImageDrag.bind(this)}
                            >
                                <img
                                    alt="Document"
                                    id={`annotation-editor-image-${this.state.currentPage}`}
                                    src={`https://appraisalfiles.blob.core.windows.net/files/${this.state.document._id}-image-${this.state.currentPage}.png`}
                                    onLoad={this.componentDidUpdate.bind(this)}
                                    className="annotationEditorImage"
                                />
                                {
                                    this.state.document.words.map((word, wordIndex) =>
                                    {
                                        if(word.page === this.state.currentPage)
                                        {
                                            return <AnnotationExtractionToken
                                                key={wordIndex}
                                                word={word}
                                                wordIndex={wordIndex}
                                                tokenRef={(component) => this.tokens[wordIndex] = component}
                                                onWordHoverStart={this.onWordHoverStart.bind(this, wordIndex)}
                                                onWordHoverEnd={this.onWordHoverEnd.bind(this, wordIndex)}
                                                onWordMouseDown={this.onWordMouseDown.bind(this, wordIndex)}
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
                    <Col xs={3} id="annotation-editor-side-menu">
                        <div style={{"marginTop": `${this.state.menuScroll}px`}} className={"side-menu-scroll-area"}>
                            {
                                this.state.selectedWord ? <Row>
                                    <Col xs={12}>
                                        <Card outline color="primary" className="mb-3">
                                            <CardHeader className="text-white bg-primary">Selected</CardHeader>
                                            <CardBody>
                                                <p>Text: {this.state.selectedWord.word}</p>
                                                <p>Line: {this.state.selectedWord.lineNumber}</p>
                                                <p>Left Column: {this.state.selectedWord.columnLeft}</p>
                                                <p>Right Column: {this.state.selectedWord.columnRight}</p>
                                                <p>Classification: {this.state.selectedWord.classification}</p>
                                                <p>Modifiers: {this.state.selectedWord.modifiers && this.state.selectedWord.modifiers.map((item, itemIndex) => {
                                                    if (itemIndex === this.state.selectedWord.modifiers.length - 1)
                                                    {
                                                        return <span>{item}</span>
                                                    }
                                                    else
                                                    {
                                                        return <span>{item}, </span>
                                                    }
                                                })}</p>

                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row> : null
                            }
                            {
                                this.state.selectedWord && this.state.selectedWord.classificationProbabilities ? <Row>
                                    <Col xs={12}>
                                        <Card outline color="primary" className="mb-3">
                                            <CardHeader className="text-white bg-primary">Debug</CardHeader>
                                            <CardBody>
                                                {
                                                    Object.keys(this.state.selectedWord.classificationProbabilities).map((label) =>
                                                    {
                                                        const prob = this.state.selectedWord.classificationProbabilities[label];
                                                        return <Row>
                                                            <Col xs={6}>
                                                                <span>{label}</span>
                                                            </Col>
                                                            <Col xs={6}>
                                                                <Progress value={prob * 100}><NumberFormat value={Math.round(prob * 100)} displayType={"text"} /></Progress>
                                                            </Col>
                                                        </Row>;
                                                    })
                                                }
                                                {
                                                    Object.keys(this.state.selectedWord.modifierProbabilities).map((label) =>
                                                    {
                                                        const prob = this.state.selectedWord.modifierProbabilities[label];
                                                        return <Row>
                                                            <Col xs={6}>
                                                                <span>{label}</span>
                                                            </Col>
                                                            <Col xs={6}>
                                                                <Progress value={prob * 100}><NumberFormat value={Math.round(prob * 100)} displayType={"text"} /></Progress>
                                                            </Col>
                                                        </Row>;
                                                    })
                                                }
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row> : null
                            }
                            {
                                this.props.annotationFields.map((group) =>
                                {
                                    if (group.multiple)
                                    {
                                        return <Row key={group.name}>
                                            <Col xs={12}>
                                                <Card outline color="primary" className="mb-3">
                                                    <CardHeader className="text-white bg-primary">{group.name}</CardHeader>
                                                    <CardBody>
                                                        <Table striped bordered hover responsive>
                                                            <thead>
                                                            <tr>
                                                                {group.fields.map((field) => <th key={field.name}>{field.name}</th>)}
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                                {
                                                                    this.state.extractedData[group.field] && this.state.extractedData[group.field].map((item) =>
                                                                    {
                                                                        return <tr key={item.lineNumber}>
                                                                            {group.fields.map((field) => <td
                                                                                id={`${field.field}-${item.lineNumber}-field`}
                                                                                key={`${item.lineNumber}-${field.field}`}
                                                                                onMouseEnter={this.onFormHoverStart.bind(this, `${field.field}-${item.lineNumber}`)}
                                                                                onMouseLeave={this.onFormHoverEnd.bind(this, `${field.field}-${item.lineNumber}`)}
                                                                            >
                                                                                <span>{item[field.field]}</span>
                                                                            </td>)}
                                                                        </tr>
                                                                    })
                                                                }
                                                            </tbody>
                                                        </Table>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                        </Row>;
                                    }
                                    else
                                    {
                                        return <Row key={group.name}>
                                            <Col xs={12}>
                                                <Card outline color="primary" className="mb-3">
                                                    <CardHeader className="text-white bg-primary">{group.name}</CardHeader>
                                                    <CardBody>
                                                        <form onSubmit={this.onSubmit}>
                                                            {group.fields.map((field) =>
                                                                <FormGroup
                                                                    key={field.field}
                                                                    className={"annotation-editor-form-field"}
                                                                    onMouseEnter={this.onFormHoverStart.bind(this, field.field)}
                                                                    onMouseLeave={this.onFormHoverEnd.bind(this, field.field)}
                                                                >
                                                                    <label className={"annotation-editor-form-field-title"}>{field.name}</label>
                                                                    <div className={"annotation-editor-form-data"} id={`${field.field}-field`}>
                                                                        {
                                                                            this.state.extractedData[field.field] ?
                                                                                <Badge color="secondary" className={"annotation-editor-extracted-data"}>
                                                                                    {this.state.extractedData[field.field]}
                                                                                </Badge> : ""
                                                                        }
                                                                    </div>
                                                                </FormGroup>)
                                                            }
                                                        </form>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                        </Row>;
                                    }
                                })
                            }
                        </div>
                    </Col>
                </Row>
                <ContextMenu id="annotation-editor-word-menu">
                    {
                        this.props.annotationFields.map((group) => {
                            return <SubMenu title={group.name} key={group.name}>
                                {group.fields && group.fields.map((field) => {
                                    return <MenuItem onClick={(evt, data) => this.changeWordClassification(evt, field.field)} key={field.field}>
                                        {field.name}
                                    </MenuItem>
                                })
                                }
                                {group.modifiers && group.modifiers.map((field) => {
                                    return [<MenuItem onClick={(evt, data) => this.addWordModifiers(evt, field.field)} key={field.field}>
                                        +{field.name}
                                    </MenuItem>,<MenuItem onClick={(evt, data) => this.removeWordModifiers(evt, field.field)} key={field.field}>
                                        -{field.name}
                                    </MenuItem>]
                                })
                                }
                            </SubMenu>
                        })
                    }
                    <MenuItem onClick={(evt, data) => this.clearWordClassification(evt)}>
                        Nothing
                    </MenuItem>
                </ContextMenu>
            </div>
        );
    }
}

export default AnnotationEditor;

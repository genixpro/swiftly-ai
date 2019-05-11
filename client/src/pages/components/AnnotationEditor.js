import React from 'react';
import {Badge, Row, Col, Card, CardBody, CardHeader, FormGroup, Table, Button} from 'reactstrap';
import ResizeObserver from 'resize-observer-polyfill';
import _ from 'underscore';
import {ContextMenu, MenuItem, SubMenu} from "react-contextmenu";
import AnnotationExtractionToken from './AnnotationExtractionToken';
import {Progress} from 'reactstrap';
import ActionButton from "./ActionButton";
import NumberFormat from 'react-number-format';
import FileModel from "../../models/FileModel";
import axios from "axios/index";
import Auth from "../../Auth";

class BlockBackground extends React.Component
{
    static defaultProps = {
        spacing: null,
        width: 1500,
        height: 1500
    };

    render()
    {
        let spacing = this.props.spacing;

        if (spacing === null)
        {
            spacing = (50 + 10 * this.props.title.toString().length)
        }

        const coords = [];
        for (let x = 20; x < this.props.width; x += spacing)
        {
            for (let y = 20; y < this.props.height; y += spacing)
            {
                coords.push({x, y})
            }
        }

        const titleLines = this.props.title.split("\n");

        return <div className={"block-background"}>
                {
                    coords.map((coords, coordIndex) =>
                    {
                        return <div
                            key={coordIndex}
                            className={"block-background-unit"}
                            style={{left: `${coords.x}px`, top: `${coords.y}px`}}
                        >
                            <div className={"block-background-unit-inner"}>
                                {
                                    titleLines.map((line) =>
                                    {
                                        return <span>{line}<br/></span>
                                    })
                                }
                            </div>
                        </div>
                    })
                }
        </div>
    }
}




class AnnotationEditor extends React.Component
{
    static _hover = Symbol("hover");

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
            extractedData: {},
            view: 'tables'
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
        this.setState({"document": this.props.document});
        this.groupedByPage = _.groupBy(this.props.document.words, (word) => word.page);
    }

    componentWillUnmount()
    {

    }

    getLines(page)
    {
        const lineBounds = {};

        if (!this.groupedByPage)
        {
            return [];
        }

        this.groupedByPage[page].forEach((word) =>
        {
            if (!lineBounds[word.lineNumber])
            {
                lineBounds[word.lineNumber] = {
                    left: word.left,
                    right: word.right,
                    top: word.top,
                    bottom: word.bottom
                }
            }
            else
            {
                lineBounds[word.lineNumber] = {
                    left: Math.min(lineBounds[word.lineNumber].left, word.left),
                    right: Math.max(lineBounds[word.lineNumber].right, word.right),
                    top: Math.min(lineBounds[word.lineNumber].top, word.top),
                    bottom: Math.max(lineBounds[word.lineNumber].bottom, word.bottom)
                }
            }
        });

        return Object.values(lineBounds);
    }

    getColumnsLeft(page)
    {
        const columnBounds = {};

        if (!this.groupedByPage)
        {
            return [];
        }

        this.groupedByPage[page].forEach((word) =>
        {
            if (!columnBounds[word.columnLeft])
            {
                columnBounds[word.columnLeft] = {
                    columnLeft: word.columnLeft,
                    left: word.left,
                    right: word.right,
                    top: word.top,
                    bottom: word.bottom
                }
            }
            else
            {
                columnBounds[word.columnLeft] = {
                    columnLeft: word.columnLeft,
                    left: Math.min(columnBounds[word.columnLeft].left, word.left),
                    right: Math.max(columnBounds[word.columnLeft].right, word.right),
                    top: Math.min(columnBounds[word.columnLeft].top, word.top),
                    bottom: Math.max(columnBounds[word.columnLeft].bottom, word.bottom)
                }
            }
        });

        return Object.values(columnBounds);
    }

    getColumnsRight(page)
    {
        const columnBounds = {};

        if (!this.groupedByPage)
        {
            return [];
        }

        this.groupedByPage[page].forEach((word) =>
        {
            if (!columnBounds[word.columnRight])
            {
                columnBounds[word.columnRight] = {
                    columnRight: word.columnRight,
                    left: word.left,
                    right: word.right,
                    top: word.top,
                    bottom: word.bottom
                }
            }
            else
            {
                columnBounds[word.columnRight] = {
                    columnRight: word.columnRight,
                    left: Math.min(columnBounds[word.columnRight].left, word.left),
                    right: Math.max(columnBounds[word.columnRight].right, word.right),
                    top: Math.min(columnBounds[word.columnRight].top, word.top),
                    bottom: Math.max(columnBounds[word.columnRight].bottom, word.bottom)
                }
            }
        });

        return Object.values(columnBounds);
    }

    getTextTypeBlocks(page)
    {
        const tableBlocks = [];

        if (!this.groupedByPage)
        {
            return [];
        }

        let currentTableBlock = null;

        this.groupedByPage[page].forEach((word) =>
        {
            if (!word.textType)
            {
                word.textType = 'block';
            }

            if (!currentTableBlock)
            {
                currentTableBlock = {
                    textType: word.textType,
                    left: word.left,
                    top: word.top,
                    right: word.right,
                    bottom: word.bottom
                }
            }
            else if (word.textType === currentTableBlock.textType)
            {
                currentTableBlock = {
                    textType: word.textType,
                    left: Math.min(currentTableBlock.left, word.left),
                    top: Math.min(currentTableBlock.top, word.top),
                    right: Math.max(currentTableBlock.right, word.right),
                    bottom: Math.max(currentTableBlock.bottom, word.bottom)
                }
            }
            else if (word.textType !== currentTableBlock.textType)
            {
                tableBlocks.push(currentTableBlock);

                currentTableBlock = {
                    textType: word.textType,
                    left: word.left,
                    top: word.top,
                    right: word.right,
                    bottom: word.bottom
                }
            }
        });

        tableBlocks.push(currentTableBlock);

        return tableBlocks;
    }

    getGroupBlocks(page, groupSet)
    {
        const groupBlocks = [];

        if (!this.groupedByPage)
        {
            return [];
        }

        let currentGroupBlock = null;

        this.groupedByPage[page].forEach((word) =>
        {
            if (word.groups[groupSet])
            {
                if (!currentGroupBlock)
                {
                    currentGroupBlock = {
                        groupSet: groupSet,
                        group: word.groups[groupSet],
                        groupNumber: word.groupNumbers[groupSet],
                        left: word.left,
                        top: word.top,
                        right: word.right,
                        bottom: word.bottom
                    }
                }
                else if (word.groups[groupSet] === currentGroupBlock.group && word.groupNumbers[groupSet] === currentGroupBlock.groupNumber)
                {
                    currentGroupBlock = {
                        groupSet: groupSet,
                        group: word.groups[groupSet],
                        groupNumber: word.groupNumbers[groupSet],
                        left: Math.min(currentGroupBlock.left, word.left),
                        top: Math.min(currentGroupBlock.top, word.top),
                        right: Math.max(currentGroupBlock.right, word.right),
                        bottom: Math.max(currentGroupBlock.bottom, word.bottom)
                    }
                }
                else
                {
                    groupBlocks.push(currentGroupBlock);

                    currentGroupBlock = {
                        groupSet: groupSet,
                        group: word.groups[groupSet],
                        groupNumber: word.groupNumbers[groupSet],
                        left: word.left,
                        top: word.top,
                        right: word.right,
                        bottom: word.bottom
                    }
                }
            }
        });

        if (currentGroupBlock)
        {
            groupBlocks.push(currentGroupBlock);
        }

        return groupBlocks;
    }

    componentDidUpdate()
    {

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

    groupSetForCurrentView()
    {
        if (this.state.view === 'dataGroups')
        {
            return 'DATA_TYPE';
        }
        else if (this.state.view === 'fields')
        {
            return 'ITEMS';
        }
        else
        {
            return null;
        }
    }

    clearSelection()
    {
        Object.values(this.tokens).forEach((wordToken) =>
        {
            if (wordToken.state.selected)
            {
                console.log("selected");
                wordToken.setState({selected: false});
            }
        });
        this.selecting = false;
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

        word[AnnotationEditor._hover] = true;
        wordToken.setState({word: word});
    }

    onWordHoverEnd(wordIndex)
    {
        const word = this.state.document.words[wordIndex];
        const wordToken = this.tokens[wordIndex];

        word[AnnotationEditor._hover] = false;
        wordToken.setState({word: word});
    }

    onFormHoverStart(field)
    {
        this.hoveredFields.push(field);
    }

    onFormHoverEnd(field)
    {
        this.hoveredFields.splice(this.hoveredFields.indexOf(field), 1);
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
        this.props.saveFile(this.state.document);
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
        this.createWordGroup(evt, null, "ITEMS", false);

        this.props.saveFile(this.state.document);
    }

    changeTextType(evt, newTextType)
    {
        evt.stopPropagation();

        const selectedLines = {};

        Object.values(this.tokens).forEach((wordToken) =>
        {
            if (wordToken.state.selected)
            {
                const word = wordToken.state.word;
                selectedLines[word.lineNumber] = true;
            }
        });
        Object.values(this.tokens).forEach((wordToken) =>
        {
            const word = wordToken.state.word;
            if (selectedLines[word.lineNumber] && word.page === this.state.currentPage)
            {
                word.textType = newTextType;
                wordToken.setState({word: word, selected: false});
            }
        });
        this.props.saveFile(this.state.document);
    }

    createWordGroup(evt, groupType, groupSet, continuePrevious)
    {
        evt.stopPropagation();

        let startLineNumber = null;
        let endLineNumber = null;

        Object.values(this.tokens).forEach((wordToken) =>
        {
            if (wordToken.state.selected)
            {
                const word = wordToken.state.word;

                if (startLineNumber === null || word.documentLineNumber < startLineNumber)
                {
                    startLineNumber = word.documentLineNumber;
                }

                if (endLineNumber === null || word.documentLineNumber > endLineNumber)
                {
                    endLineNumber = word.documentLineNumber;
                }
            }
        });

        let currentOrigGroupNumber = 0;
        let currentNewGroupNumber = null;
        let handlingNewGroup = false;
        let handlingPostGroups = false;
        let lastGroupType = null;
        this.props.document.words.forEach((word) =>
        {
            if (word.documentLineNumber < startLineNumber)
            {
                if (word.groups[groupSet])
                {
                    lastGroupType = word.groups[groupSet];
                    currentOrigGroupNumber = Math.max(word.groupNumbers[groupSet], currentOrigGroupNumber);
                    currentNewGroupNumber = currentOrigGroupNumber;
                }
            }
            else if (word.documentLineNumber >= startLineNumber && word.documentLineNumber <= endLineNumber)
            {
                if (!handlingNewGroup)
                {
                    if (groupType !== null)
                    {
                        if (currentNewGroupNumber !== null)
                        {
                            if (!continuePrevious)
                            {
                                currentNewGroupNumber += 1;
                            }
                        }
                        else
                        {
                            currentNewGroupNumber = 0;
                        }
                    }
                    handlingNewGroup = true;
                }

                if (groupType !== null)
                {
                    word.groups[groupSet] = groupType;
                    word.groupNumbers[groupSet] = currentNewGroupNumber;
                }
                else if(continuePrevious && lastGroupType)
                {
                    word.groups[groupSet] = lastGroupType;
                    word.groupNumbers[groupSet] = currentNewGroupNumber;
                }
                else
                {
                    delete word.groups[groupSet];
                    delete word.groupNumbers[groupSet];
                }
            }
            else if (word.documentLineNumber > endLineNumber)
            {
                if (word.groups[groupSet])
                {
                    if (!handlingPostGroups)
                    {
                        currentOrigGroupNumber = word.groupNumbers[groupSet];
                        if (currentNewGroupNumber !== null)
                        {
                            currentNewGroupNumber += 1;
                        }
                        else
                        {
                            currentNewGroupNumber = 0;
                        }
                        handlingPostGroups = true;
                    }

                    if (word.groupNumbers[groupSet] !== currentOrigGroupNumber)
                    {
                        currentOrigGroupNumber = word.groupNumbers[groupSet];
                        currentNewGroupNumber += 1;
                    }
                    word.groupNumbers[groupSet] = currentNewGroupNumber;
                }
            }

            if (this.tokens[word.index])
            {
                this.tokens[word.index].setState({word: word, selected: false});
            }
        });
        this.setState({document: this.state.document});
        this.props.saveFile(this.state.document);
    }

    selectionModifiers()
    {
        const present = {};
        const all = {};
        Object.values(this.tokens).forEach((wordToken) =>
        {
            if (wordToken.state.selected)
            {
                for (let modifier of wordToken.state.word.modifiers)
                {
                    present[modifier] = true;

                    if (_.isUndefined(all[modifier]))
                    {
                        all[modifier] = true;
                    }
                }

                for (let allModifier of Object.keys(all))
                {
                    if(wordToken.state.word.modifiers.indexOf(allModifier) === -1)
                    {
                        all[allModifier] = false;
                    }
                }
            }
        });

        return {present: Object.keys(present), all: _.filter(Object.keys(all), (key) => all[key])};
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
        this.props.saveFile(this.state.document);
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
        this.props.saveFile(this.state.document);
    }

    getAnnotationInformation(value)
    {
        for (let annotationGroup of this.props.annotationFields)
        {
            if (annotationGroup.fields)
            {
                for (let field of annotationGroup.fields)
                {
                    if (field.value === value)
                    {
                        return field;
                    }
                }
            }
            if (annotationGroup.modifiers)
            {
                for (let modifier of annotationGroup.modifiers)
                {
                    if (modifier.value === value)
                    {
                        return modifier;
                    }
                }
            }
            if (annotationGroup.groups)
            {
                for (let field of annotationGroup.groups)
                {
                    if (field.value === value)
                    {
                        return field;
                    }
                }
            }
        }
        return null;
    }

    saveFile()
    {
        this.props.saveFile(this.state.document);
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
        else if (currentZoom < 250)
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
        if (evt.button === 0)
        {
            this.clearSelection();

            const element = document.getElementById('annotation-editor-image-outer-container');
            this.dragStartElementScrollX = element.scrollLeft;
            this.dragStartElementScrollY = element.scrollTop;

            this.dragStartX = evt.clientX;
            this.dragStartY = evt.clientY;
            this.isDraggingImage = true;
        }
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
        this.setState({document: document}, () => this.saveFile());
    }

    reprocessFile()
    {
        return this.props.reprocessFile();
    }

    onViewChanged(page, newView)
    {
        this.setState({view: newView});
    }


    render()
    {
        return (
            <div id={"annotation-editor-extractions"} onMouseUp={this.onMouseUp.bind(this)} onMouseMove={this.onMouseMove.bind(this)}>
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
                                            src={`${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.document.appraisalId}/files/${this.props.document._id}/rendered/${page}?access_token=${Auth.getAccessToken()}`}
                                            onLoad={this.componentDidUpdate.bind(this)}
                                            onClick={() => this.changePage(page)}
                                            className="annotationEditorImageThumbnail"
                                        />

                                        <select className="custom-select" value={this.state.document.pageTypes[page]}
                                                onChange={(evt) => this.onPageTypeChanged(page, evt.target.value)}>
                                            {
                                                this.pageTypes.map((pageType) => <option key={pageType}
                                                                                         value={pageType}>{this.humanFriendlyPageType[pageType]}</option>)
                                            }
                                        </select>

                                        {/*<span>{this.humanFriendlyPageType[this.state.document.pageTypes[page]]}</span>*/}
                                    </CardBody>
                                </Card>;
                            })
                        }
                    </Col>
                    <Col xs={7}>
                        <div className={"extractions-toolbar"}>
                            <div>
                                <span>View:</span>
                            </div>
                            <div>
                                <select className="custom-select" value={this.state.view}
                                        onChange={(evt) => this.onViewChanged(this.state.currentPage, evt.target.value)}>
                                    <option value={"tables"}>Tables</option>
                                    <option value={"lines"}>Lines</option>
                                    <option value={"columnLeft"}>Columns (Left Alignment)</option>
                                    <option value={"columnRight"}>Columns (Right Alignnment)</option>
                                    <option value={"dataGroups"}>Data Groups</option>
                                    <option value={"fields"}>Fields</option>
                                </select>
                            </div>
                            <div>
                                <ActionButton onClick={() => this.reprocessFile()}> Reprocess </ActionButton>
                            </div>
                            <div className={"toolbar-label"}>
                                <span>Page Type</span>
                            </div>
                            <div>
                                <select className="custom-select" value={this.state.document.pageTypes[this.state.currentPage]}
                                        onChange={(evt) => this.onPageTypeChanged(this.state.currentPage, evt.target.value)}>
                                    {
                                        this.pageTypes.map((pageType) => <option key={pageType}
                                                                                 value={pageType}>{this.humanFriendlyPageType[pageType]}</option>)
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
                                    src={`${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.document.appraisalId}/files/${this.props.document._id}/rendered/${this.state.currentPage}?access_token=${Auth.getAccessToken()}`}
                                    onLoad={this.componentDidUpdate.bind(this)}
                                    className="annotationEditorImage"
                                />
                                {
                                    this.state.view === 'lines' ? this.getLines(this.state.currentPage).map((line) =>
                                    {
                                        const position = {
                                            "left": (line.left * 100).toString() + "%",
                                            "top": (line.top * 100).toString() + "%",
                                            "width": (line.right * 100 - line.left * 100).toString() + "%",
                                            "height": (line.bottom * 100 - line.top * 100).toString() + "%"
                                        };

                                        return <div style={position} className={"line-token"}>

                                        </div>
                                    }) : null
                                }
                                {
                                    this.state.view === 'columnLeft' ? this.getColumnsLeft(this.state.currentPage).map((column) =>
                                    {
                                        const position = {
                                            "left": (column.left * 100).toString() + "%",
                                            "top": (column.top * 100).toString() + "%",
                                            "width": (column.right * 100 - column.left * 100).toString() + "%",
                                            "height": (column.bottom * 100 - column.top * 100).toString() + "%"
                                        };

                                        return <div style={position} className={"column-token"}>
                                            <BlockBackground title={`#${column.columnLeft}`}
                                                             width={(column.right - column.left) * (this.state.imageZoom/100) * document.body.getBoundingClientRect().width}
                                                             height={(column.bottom - column.top) * (this.state.imageZoom/100) * document.body.getBoundingClientRect().height}
                                            />
                                        </div>
                                    }) : null
                                }
                                {
                                    this.state.view === 'columnRight' ? this.getColumnsRight(this.state.currentPage).map((column) =>
                                    {
                                        const position = {
                                            "left": (column.left * 100).toString() + "%",
                                            "top": (column.top * 100).toString() + "%",
                                            "width": (column.right * 100 - column.left * 100).toString() + "%",
                                            "height": (column.bottom * 100 - column.top * 100).toString() + "%"
                                        };

                                        return <div style={position} className={"column-token"}>
                                            <BlockBackground title={`#${column.columnRight}`}
                                                             width={(column.right - column.left) * (this.state.imageZoom/100) * document.body.getBoundingClientRect().width}
                                                             height={(column.bottom - column.top) * (this.state.imageZoom/100) * document.body.getBoundingClientRect().height}
                                            />
                                        </div>
                                    }) : null
                                }
                                {
                                    this.state.view === 'tables' ? this.getTextTypeBlocks(this.state.currentPage).map((tableBlock) =>
                                    {
                                        const position = {
                                            "left": (tableBlock.left * 100).toString() + "%",
                                            "top": (tableBlock.top * 100).toString() + "%",
                                            "width": (tableBlock.right * 100 - tableBlock.left * 100).toString() + "%",
                                            "height": (tableBlock.bottom * 100 - tableBlock.top * 100).toString() + "%"
                                        };

                                        return <div style={position} className={`table-block-token ${tableBlock.textType}`}>
                                            <BlockBackground title={tableBlock.textType}
                                                             width={(tableBlock.right - tableBlock.left) * (this.state.imageZoom/100) * document.body.getBoundingClientRect().width}
                                                             height={(tableBlock.bottom - tableBlock.top) * (this.state.imageZoom/100) * document.body.getBoundingClientRect().height}
                                            />
                                        </div>
                                    }) : null
                                }
                                {
                                    this.state.view === 'dataGroups' ? this.getGroupBlocks(this.state.currentPage, "DATA_TYPE").map((groupBlock) =>
                                    {
                                        const position = {
                                            "left": (groupBlock.left * 100).toString() + "%",
                                            "top": (groupBlock.top * 100).toString() + "%",
                                            "width": (groupBlock.right * 100 - groupBlock.left * 100).toString() + "%",
                                            "height": (groupBlock.bottom * 100 - groupBlock.top * 100).toString() + "%"
                                        };

                                        return <div style={position} className={`group-block-token ${groupBlock.group}`}>
                                            <BlockBackground title={`${this.getAnnotationInformation(groupBlock.group).name}\n${groupBlock.groupNumber}`}
                                                             width={(groupBlock.right - groupBlock.left) * (this.state.imageZoom/100) * document.body.getBoundingClientRect().width}
                                                             height={(groupBlock.bottom - groupBlock.top) * (this.state.imageZoom/100) * document.body.getBoundingClientRect().height}
                                            />
                                        </div>
                                    }) : null
                                }
                                {
                                    this.state.view === 'fields' ? this.getGroupBlocks(this.state.currentPage, "ITEMS").map((groupBlock) =>
                                    {
                                        const position = {
                                            "left": (groupBlock.left * 100).toString() + "%",
                                            "top": (groupBlock.top * 100).toString() + "%",
                                            "width": (groupBlock.right * 100 - groupBlock.left * 100).toString() + "%",
                                            "height": (groupBlock.bottom * 100 - groupBlock.top * 100).toString() + "%"
                                        };

                                        return <div style={position} className={`group-block-token ${groupBlock.group}`}>
                                            <BlockBackground title={`${this.getAnnotationInformation(groupBlock.group).name}\n${groupBlock.groupNumber}`}
                                                             width={(groupBlock.right - groupBlock.left) * (this.state.imageZoom/100) * document.body.getBoundingClientRect().width}
                                                             height={(groupBlock.bottom - groupBlock.top) * (this.state.imageZoom/100) * document.body.getBoundingClientRect().height}
                                            />
                                        </div>
                                    }) : null
                                }
                                {
                                    this.state.document.words.map((word, wordIndex) =>
                                    {
                                        if (word.page === this.state.currentPage)
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
                                                <p>Modifiers: {this.state.selectedWord.modifiers && this.state.selectedWord.modifiers.map((item, itemIndex) =>
                                                {
                                                    if (itemIndex === this.state.selectedWord.modifiers.length - 1)
                                                    {
                                                        return <span key={itemIndex}>{item}</span>
                                                    }
                                                    else
                                                    {
                                                        return <span key={itemIndex}>{item}, </span>
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
                                                                <Progress value={prob * 100}><NumberFormat value={Math.round(prob * 100)} displayType={"text"}/></Progress>
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
                                                                <Progress value={prob * 100}><NumberFormat value={Math.round(prob * 100)} displayType={"text"}/></Progress>
                                                            </Col>
                                                        </Row>;
                                                    })
                                                }
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row> : null
                            }
                            {/*{*/}
                            {/*this.props.annotationFields.map((group) =>*/}
                            {/*{*/}
                            {/*if (group.multiple)*/}
                            {/*{*/}
                            {/*return <Row key={group.name}>*/}
                            {/*<Col xs={12}>*/}
                            {/*<Card outline color="primary" className="mb-3">*/}
                            {/*<CardHeader className="text-white bg-primary">{group.name}</CardHeader>*/}
                            {/*<CardBody>*/}
                            {/*<Table striped bordered hover responsive>*/}
                            {/*<thead>*/}
                            {/*<tr>*/}
                            {/*{group.fields.map((field) => <th key={field.name}>{field.name}</th>)}*/}
                            {/*</tr>*/}
                            {/*</thead>*/}
                            {/*<tbody>*/}
                            {/*{*/}
                            {/*this.state.extractedData[group.value] && this.state.extractedData[group.value].map((item) =>*/}
                            {/*{*/}
                            {/*return <tr key={item.lineNumber}>*/}
                            {/*{group.fields.map((field) => <td*/}
                            {/*id={`${field.value}-${item.lineNumber}-field`}*/}
                            {/*key={`${item.lineNumber}-${field.value}`}*/}
                            {/*onMouseEnter={this.onFormHoverStart.bind(this, `${field.value}-${item.lineNumber}`)}*/}
                            {/*onMouseLeave={this.onFormHoverEnd.bind(this, `${field.value}-${item.lineNumber}`)}*/}
                            {/*>*/}
                            {/*<span>{item[field.value]}</span>*/}
                            {/*</td>)}*/}
                            {/*</tr>*/}
                            {/*})*/}
                            {/*}*/}
                            {/*</tbody>*/}
                            {/*</Table>*/}
                            {/*</CardBody>*/}
                            {/*</Card>*/}
                            {/*</Col>*/}
                            {/*</Row>;*/}
                            {/*}*/}
                            {/*else*/}
                            {/*{*/}
                            {/*return <Row key={group.name}>*/}
                            {/*<Col xs={12}>*/}
                            {/*<Card outline color="primary" className="mb-3">*/}
                            {/*<CardHeader className="text-white bg-primary">{group.name}</CardHeader>*/}
                            {/*<CardBody>*/}
                            {/*<form onSubmit={this.onSubmit}>*/}
                            {/*{group.fields.map((field) =>*/}
                            {/*<FormGroup*/}
                            {/*key={field.value}*/}
                            {/*className={"annotation-editor-form-field"}*/}
                            {/*onMouseEnter={this.onFormHoverStart.bind(this, field.value)}*/}
                            {/*onMouseLeave={this.onFormHoverEnd.bind(this, field.value)}*/}
                            {/*>*/}
                            {/*<label className={"annotation-editor-form-field-title"}>{field.name}</label>*/}
                            {/*<div className={"annotation-editor-form-data"} id={`${field.value}-field`}>*/}
                            {/*{*/}
                            {/*this.state.extractedData[field.value] ?*/}
                            {/*<Badge color="secondary" className={"annotation-editor-extracted-data"}>*/}
                            {/*{this.state.extractedData[field.value]}*/}
                            {/*</Badge> : ""*/}
                            {/*}*/}
                            {/*</div>*/}
                            {/*</FormGroup>)*/}
                            {/*}*/}
                            {/*</form>*/}
                            {/*</CardBody>*/}
                            {/*</Card>*/}
                            {/*</Col>*/}
                            {/*</Row>;*/}
                            {/*}*/}
                            {/*})*/}
                            {/*}*/}
                        </div>
                    </Col>
                </Row>
                <ContextMenu id="annotation-editor-word-menu">
                    {
                        this.state.view === 'tables' ?
                            <MenuItem onClick={(evt, data) => this.changeTextType(evt, 'table')}>
                                Mark as Table
                            </MenuItem> : null
                    }
                    {
                        this.state.view === 'tables' ?
                            <MenuItem onClick={(evt, data) => this.changeTextType(evt, 'block')}>
                                Mark as Text Block
                            </MenuItem> : null
                    }
                    {
                        this.props.annotationFields.map((group) =>
                        {
                            const groupSet = this.groupSetForCurrentView();

                            const {present:presentModifiers,all:allModifiers} = this.selectionModifiers();

                            let groupsElement = null;
                            if (group.groups)
                            {
                                groupsElement = group.groups.map((wordGroup) =>
                                {
                                    if (wordGroup.groupSet !== groupSet)
                                    {
                                        return null;
                                    }

                                    return <MenuItem onClick={(evt, data) => this.createWordGroup(evt, wordGroup.value, wordGroup.groupSet)} key={wordGroup.value}>
                                        {wordGroup.name}
                                    </MenuItem>
                                });
                            }

                            let fieldsElement = null;
                            if (this.state.view === 'fields' && group.fields)
                            {
                                fieldsElement = group.fields.map((field) =>
                                {
                                    return <MenuItem onClick={(evt, data) => this.changeWordClassification(evt, field.value)} key={field.value}>
                                        {field.name}
                                    </MenuItem>
                                });
                            }

                            let modifiersElement = null;
                            if (this.state.view === 'fields' && group.modifiers)
                            {
                                modifiersElement = group.modifiers.map((modifier) =>
                                {
                                    const elems = [];

                                    if (presentModifiers.indexOf(modifier.value) !== -1)
                                    {
                                        elems.push(<MenuItem onClick={(evt, data) => this.removeWordModifiers(evt, modifier.value)} key={modifier.value + "-"}>
                                            --{modifier.name}
                                        </MenuItem>);
                                    }

                                    if (allModifiers.indexOf(modifier.value) === -1)
                                    {
                                        elems.push(<MenuItem onClick={(evt, data) => this.addWordModifiers(evt, modifier.value)} key={modifier.value + "+"}>
                                            ++{modifier.name}
                                        </MenuItem>);
                                    }

                                    return elems;
                                })
                            }

                            if (!groupsElement && !fieldsElement && !modifiersElement)
                            {
                                return null;
                            }

                            return <SubMenu title={group.name} key={group.name}>
                                {groupsElement}
                                {fieldsElement}
                                {modifiersElement}
                            </SubMenu>
                        })
                    }
                    {
                        this.state.view === 'fields' ?
                            <MenuItem onClick={(evt, data) => this.clearWordClassification(evt)}>
                                Nothing
                            </MenuItem> : null
                    }
                    {
                        this.state.view === 'dataGroups' ?
                            <MenuItem onClick={(evt, data) => this.createWordGroup(evt, null, 'DATA_TYPE', true)}>
                                Continue Previous Group
                            </MenuItem> : null
                    }
                    {
                        this.state.view === 'dataGroups' ?
                            <MenuItem onClick={(evt, data) => this.createWordGroup(evt, null, 'DATA_TYPE')}>
                                No Group
                            </MenuItem> : null
                    }
                </ContextMenu>
            </div>
        );
    }
}

export default AnnotationEditor;

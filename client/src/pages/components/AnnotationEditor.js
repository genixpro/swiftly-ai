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
                                    titleLines.map((line, lineIndex) =>
                                    {
                                        return <span key={lineIndex}>{line}<br/></span>
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
            file: {
                _id: {},
                words: []
            },
            imageZoom: 100,
            extractedData: {},
            view: 'tables'
        };

        this.selecting = false;
        this.tokens = {};
        this.hoveredFields = [];
    }

    componentDidMount()
    {
        axios.get(`/appraisal/${this.props.appraisalId}/files/${this.props.fileId}`).then((response) => {
            const file = FileModel.create(response.data.file);
            this.groupedByPage = _.groupBy(file.words, (word) => word.page);
            this.setState({file: file});
        });
    }

    componentDidUpdate() {

    }

    saveFileData(newFile)
    {
        this.setState({file: newFile});

        axios.post(`/appraisal/${this.props.appraisalId}/files/${this.props.fileId}`, newFile).then((response) => {
            // const file = FileModel.create(response.data.file);
            // this.setState({file: file});
            // this.groupedByPage = _.groupBy(file.words, (word) => word.page);
            // Object.keys(this.tokens).forEach((wordIndex) =>
            // {
            //     const token = this.tokens[wordIndex];
            //     const word = file.words[wordIndex];
            //     token.setState({word: word});
            // });
        });
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

    getColumns(page)
    {
        const columnBounds = {};

        if (!this.groupedByPage)
        {
            return [];
        }

        this.groupedByPage[page].forEach((word) =>
        {
            if (word.column === 0)
            {
                return;
            }

            if (!columnBounds[word.column])
            {
                columnBounds[word.column] = {
                    column: word.column,
                    left: word.left,
                    right: word.right,
                    top: word.top,
                    bottom: word.bottom
                }
            }
            else
            {
                columnBounds[word.column] = {
                    column: word.column,
                    left: Math.min(columnBounds[word.column].left, word.left),
                    right: Math.max(columnBounds[word.column].right, word.right),
                    top: Math.min(columnBounds[word.column].top, word.top),
                    bottom: Math.max(columnBounds[word.column].bottom, word.bottom)
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

    getFieldBlocks(page, groupSet)
    {
        const fieldBlocks = [];

        if (!this.groupedByPage)
        {
            return [];
        }

        let currentFieldBlock = null;

        this.groupedByPage[page].forEach((word) =>
        {
            if (word.classification && word.classification !== "null")
            {
                if (!currentFieldBlock)
                {
                    currentFieldBlock = {
                        classification: word.classification,
                        modifiers: word.modifiers,
                        left: word.left,
                        top: word.top,
                        right: word.right,
                        bottom: word.bottom
                    }
                }
                else if (word.classification === currentFieldBlock.classification &&
                    word.modifiers.length === currentFieldBlock.modifiers.length &&
                    _.all(word.modifiers, (modifier) => currentFieldBlock.modifiers.indexOf(modifier) !== -1))
                {
                    currentFieldBlock = {
                        classification: word.classification,
                        modifiers: word.modifiers,
                        left: Math.min(currentFieldBlock.left, word.left),
                        top: Math.min(currentFieldBlock.top, word.top),
                        right: Math.max(currentFieldBlock.right, word.right),
                        bottom: Math.max(currentFieldBlock.bottom, word.bottom)
                    }
                }
                else
                {
                    fieldBlocks.push(currentFieldBlock);

                    currentFieldBlock = {
                        classification: word.classification,
                        modifiers: word.modifiers,
                        left: word.left,
                        top: word.top,
                        right: word.right,
                        bottom: word.bottom
                    }
                }
            }
            else
            {
                if (currentFieldBlock)
                {
                    fieldBlocks.push(currentFieldBlock);
                }
                currentFieldBlock = null;
            }
        });

        if (currentFieldBlock)
        {
            fieldBlocks.push(currentFieldBlock);
        }

        return fieldBlocks;
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
                wordToken.setState({selected: false});
            }
        });
        this.selecting = false;
    }

    onWordHoverStart(wordIndex)
    {
        const word = this.state.file.words[wordIndex];
        const wordToken = this.tokens[wordIndex];

        this.setState({selectedWord: word});

        if (this.selecting)
        {
            let selectMode = "box";
            if (this.state.view === 'tables' || this.state.view === 'dataGroups' || this.state.view === 'lines')
            {
                selectMode = 'line';
            }

            const startWord = this.state.file.words[this.selectStart];
            // const startWordToken = this.tokens[this.selectStart];

            const endWord = this.state.file.words[wordIndex];
            // const endWordToken = this.tokens[wordIndex];

            if (selectMode === 'box')
            {
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
            else if (selectMode === 'line')
            {
                const startLine = Math.min(startWord.lineNumber, endWord.lineNumber);
                const endLine = Math.max(startWord.lineNumber, endWord.lineNumber);


                Object.values(this.tokens).forEach((wordToken, wordTokenIndex) =>
                {
                    const shouldSelect = wordToken.state.word.lineNumber >= startLine && wordToken.state.word.lineNumber <= endLine;

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

        }

        word[AnnotationEditor._hover] = true;
        wordToken.setState({word: word});
    }

    onWordHoverEnd(wordIndex)
    {
        const word = this.state.file.words[wordIndex];
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
            if (wordToken.state.selected || wordToken.state.word[AnnotationEditor._hover])
            {
                const word = wordToken.state.word;
                word.classification = "null";
                word.modifiers = [];
                wordToken.setState({word: word});
            }
        });
        this.createWordGroup(evt, null, "ITEMS", false);

        this.saveFileData(this.state.file);
    }

    changeWordClassification(evt, newClass)
    {
        evt.stopPropagation();

        Object.values(this.tokens).forEach((wordToken) =>
        {
            if (wordToken.state.selected || wordToken.state.word[AnnotationEditor._hover])
            {
                const word = wordToken.state.word;
                word.classification = newClass;
                wordToken.setState({word: word, selected: false});
            }
        });

        this.saveFileData(this.state.file);
    }

    changeTextType(evt, newTextType)
    {
        evt.stopPropagation();

        const selectedLines = {};

        Object.values(this.tokens).forEach((wordToken) =>
        {
            if (wordToken.state.selected || wordToken.state.word[AnnotationEditor._hover])
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
        this.saveFileData(this.state.file);
    }

    createWordGroup(evt, groupType, groupSet, continuePrevious)
    {
        evt.stopPropagation();

        let startLineNumber = null;
        let endLineNumber = null;

        Object.values(this.tokens).forEach((wordToken) =>
        {
            if (wordToken.state.selected || wordToken.state.word[AnnotationEditor._hover])
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
        this.state.file.words.forEach((word) =>
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
        this.setState({file: this.state.file});
        this.saveFileData(this.state.file);
    }

    selectionModifiers()
    {
        const present = {};
        const all = {};
        Object.values(this.tokens).forEach((wordToken) =>
        {
            if (wordToken.state.selected || wordToken.state.word[AnnotationEditor._hover])
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

    selectionGroups()
    {
        const present = {};
        const all = {};
        const allGroupSets = {};

        Object.values(this.tokens).forEach((wordToken) =>
        {
            if (wordToken.state.selected || wordToken.state.word[AnnotationEditor._hover])
            {
                for (let groupSet of Object.keys(wordToken.state.word.groups))
                {
                    const group = wordToken.state.word.groups[groupSet];

                    if(group)
                    {
                        present[group] = true;

                        if (_.isUndefined(all[group]))
                        {
                            all[group] = true;
                            allGroupSets[group] = groupSet;
                        }
                    }
                }

                for (let allGroup of Object.keys(all))
                {
                    const groupSet = allGroupSets[allGroup];
                    if (wordToken.state.word.groups[groupSet] !== allGroup)
                    {
                        all[allGroup] = false;
                    }
                }
            }
        });

        return {present: Object.keys(present), all: _.filter(Object.keys(all), (key) => all[key])};
    }

    selectionTextTypes()
    {
        const present = {};
        const all = {};
        Object.values(this.tokens).forEach((wordToken) =>
        {
            if (wordToken.state.selected || wordToken.state.word[AnnotationEditor._hover])
            {
                present[wordToken.state.word.textType] = true;

                if (_.isUndefined(all[wordToken.state.word.textType]))
                {
                    all[wordToken.state.word.textType] = true;
                }

                for (let allTextType of Object.keys(all))
                {
                    if(wordToken.state.word.textType !== allTextType)
                    {
                        all[allTextType] = false;
                    }
                }
            }
        });

        return {present: Object.keys(present), all: _.filter(Object.keys(all), (key) => all[key])};
    }

    selectedDocumentLineNumbers()
    {
        const present = {};
        Object.values(this.tokens).forEach((wordToken) =>
        {
            if (wordToken.state.selected || wordToken.state.word[AnnotationEditor._hover])
            {
                present[wordToken.state.word.documentLineNumber] = true;
            }
        });

        return Object.keys(present).map((num) => Number(num));
    }


    addWordModifiers(evt, newModifier)
    {
        evt.stopPropagation();

        if (this.getAnnotationInformation(newModifier).applyAcrossLine)
        {
            const selectionLineNumbers = this.selectedDocumentLineNumbers();
            Object.values(this.tokens).forEach((wordToken) =>
            {
                const word = wordToken.state.word;
                if (selectionLineNumbers.indexOf(word.documentLineNumber) !== -1)
                {
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
        }
        else
        {
            Object.values(this.tokens).forEach((wordToken) =>
            {
                if (wordToken.state.selected || wordToken.state.word[AnnotationEditor._hover])
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
        }
        this.saveFileData(this.state.file);
    }


    removeWordModifiers(evt, newModifier)
    {
        evt.stopPropagation();

        if (this.getAnnotationInformation(newModifier).applyAcrossLine)
        {
            const selectionLineNumbers = this.selectedDocumentLineNumbers();
            Object.values(this.tokens).forEach((wordToken) =>
            {
                const word = wordToken.state.word;
                if (selectionLineNumbers.indexOf(word.documentLineNumber) !== -1)
                {
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
        }
        else
        {
            Object.values(this.tokens).forEach((wordToken) =>
            {
                if (wordToken.state.selected || wordToken.state.word[AnnotationEditor._hover])
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
        }
        this.saveFileData(this.state.file);
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
        this.saveFileData(this.state.file);
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
        }
    }

    reprocessFile()
    {
        return this.props.reprocessFile();
    }

    onViewChanged(page, newView)
    {
        this.setState({view: newView});
    }

    onReviewStatusChanged(newStatus)
    {
        this.state.file.reviewStatus = newStatus;

        this.saveFileData(this.state.file);
    }


    render()
    {
        // Calculated here to avoid redundancy
        const groupSet = this.groupSetForCurrentView();
        const {present:presentSelectionModifiers,all:allSelectionModifiers} = this.selectionModifiers();
        const {present:presentSelectionGroups, all:allSelectionGroups} = this.selectionGroups();
        const {present:presentSelectionTextTypes} = this.selectionTextTypes();

        return (
            <div id={"annotation-editor-extractions"} onMouseUp={this.onMouseUp.bind(this)} onMouseMove={this.onMouseMove.bind(this)}>
                <Row>
                    <Col xs={2}>
                        {
                            _.range(this.state.file.pages).map((page) =>
                            {
                                return <Card outline color="primary" className="annotation-editor-thumbnail-container" key={page}>
                                    <CardBody>
                                        <img
                                            alt="Document Preview"
                                            id={`annotation-editor-image-${page}-thumbnail`}
                                            src={`${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisalId}/files/${this.props.fileId}/rendered/${page}?access_token=${Auth.getAccessToken()}`}
                                            onClick={() => this.changePage(page)}
                                            className="annotationEditorImageThumbnail"
                                        />
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
                                    <option value={"columns"}>Columns</option>
                                    <option value={"dataGroups"}>Data Groups</option>
                                    <option value={"fields"}>Fields</option>
                                </select>
                            </div>
                            <div>
                                <span>Review Status:</span>
                            </div>
                            <div>
                                <select className="custom-select" value={this.state.file.reviewStatus}
                                        onChange={(evt) => this.onReviewStatusChanged(evt.target.value)}>
                                    <option value={"fresh"}>Fresh</option>
                                    <option value={"in_review"}>In Review</option>
                                    <option value={"verifed"}>Verified</option>
                                </select>
                            </div>
                            <div>
                                <ActionButton onClick={() => this.reprocessFile()}> Reprocess </ActionButton>
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
                                    src={`${process.env.VALUATE_ENVIRONMENT.REACT_APP_SERVER_URL}appraisal/${this.props.appraisalId}/files/${this.props.fileId}/rendered/${this.state.currentPage}?access_token=${Auth.getAccessToken()}`}
                                    onLoad={this.componentDidUpdate.bind(this)}
                                    className="annotationEditorImage"
                                />
                                {
                                    this.state.view === 'lines' ? this.getLines(this.state.currentPage).map((line, lineIndex) =>
                                    {
                                        const position = {
                                            "left": (line.left * 100).toString() + "%",
                                            "top": (line.top * 100).toString() + "%",
                                            "width": (line.right * 100 - line.left * 100).toString() + "%",
                                            "height": (line.bottom * 100 - line.top * 100).toString() + "%"
                                        };

                                        return <div style={position} className={"line-token"} key={lineIndex} title={`Line ${lineIndex+1}`}>

                                        </div>
                                    }) : null
                                }
                                {
                                    this.state.view === 'columns' ? this.getColumns(this.state.currentPage).map((column, columnIndex) =>
                                    {
                                        const position = {
                                            "left": (column.left * 100).toString() + "%",
                                            "top": (column.top * 100).toString() + "%",
                                            "width": (column.right * 100 - column.left * 100).toString() + "%",
                                            "height": (column.bottom * 100 - column.top * 100).toString() + "%"
                                        };

                                        return <div style={position} className={"column-token"} key={columnIndex} title={`Column #${column.column}`}>
                                            <BlockBackground title={`#${column.column}`}
                                                             width={(column.right - column.left) * (this.state.imageZoom/100) * document.body.getBoundingClientRect().width}
                                                             height={(column.bottom - column.top) * (this.state.imageZoom/100) * document.body.getBoundingClientRect().height}
                                            />
                                        </div>
                                    }) : null
                                }
                                {
                                    this.state.view === 'tables' ? this.getTextTypeBlocks(this.state.currentPage).map((tableBlock, tableBlockIndex) =>
                                    {
                                        const position = {
                                            "left": (tableBlock.left * 100).toString() + "%",
                                            "top": (tableBlock.top * 100).toString() + "%",
                                            "width": (tableBlock.right * 100 - tableBlock.left * 100).toString() + "%",
                                            "height": (tableBlock.bottom * 100 - tableBlock.top * 100).toString() + "%"
                                        };

                                        return <div style={position} className={`table-block-token ${tableBlock.textType}`} key={tableBlockIndex} title={tableBlock.textType}>
                                            <BlockBackground title={tableBlock.textType}
                                                             width={(tableBlock.right - tableBlock.left) * (this.state.imageZoom/100) * document.body.getBoundingClientRect().width}
                                                             height={(tableBlock.bottom - tableBlock.top) * (this.state.imageZoom/100) * document.body.getBoundingClientRect().height}
                                            />
                                        </div>
                                    }) : null
                                }
                                {
                                    this.state.view === 'fields' ? this.getFieldBlocks(this.state.currentPage).map((fieldBlock, fieldBlockIndex) =>
                                    {
                                        const position = {
                                            "left": (fieldBlock.left * 100).toString() + "%",
                                            "top": (fieldBlock.top * 100).toString() + "%",
                                            "width": (fieldBlock.right * 100 - fieldBlock.left * 100).toString() + "%",
                                            "height": (fieldBlock.bottom * 100 - fieldBlock.top * 100).toString() + "%"
                                        };

                                        return <div style={position} className={`field-block-token ${fieldBlock.textType}`} key={fieldBlockIndex} title={fieldBlock.classification} />
                                    }) : null
                                }
                                {
                                    groupSet !== null ? this.getGroupBlocks(this.state.currentPage, groupSet).map((groupBlock, groupBlockIndex) =>
                                    {
                                        const position = {
                                            "left": (groupBlock.left * 100).toString() + "%",
                                            "top": (groupBlock.top * 100).toString() + "%",
                                            "width": (groupBlock.right * 100 - groupBlock.left * 100).toString() + "%",
                                            "height": (groupBlock.bottom * 100 - groupBlock.top * 100).toString() + "%"
                                        };

                                        return <div style={position} className={`group-block-token ${groupBlock.group}`} key={groupBlockIndex} title={`${this.getAnnotationInformation(groupBlock.group).name} ${groupBlock.groupNumber}`}>
                                            <BlockBackground title={`${this.getAnnotationInformation(groupBlock.group).name}\n${groupBlock.groupNumber}`}
                                                             width={(groupBlock.right - groupBlock.left) * (this.state.imageZoom/100) * document.body.getBoundingClientRect().width}
                                                             height={(groupBlock.bottom - groupBlock.top) * (this.state.imageZoom/100) * document.body.getBoundingClientRect().height}
                                            />
                                        </div>
                                    }) : null
                                }
                                {
                                    this.state.file.words.map((word, wordIndex) =>
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
                                                <p>Document Line: {this.state.selectedWord.documentLineNumber}</p>
                                                <p>Column: {this.state.selectedWord.column}</p>
                                                <p>Classification: {this.state.selectedWord.classification}</p>
                                                <p>Groups: {JSON.stringify(this.state.selectedWord.groups)}</p>
                                                <p>Index: {this.state.selectedWord.index}</p>
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
                                                    Object.keys(this.state.selectedWord.classificationProbabilities).map((label, labelIndex) =>
                                                    {
                                                        const prob = this.state.selectedWord.classificationProbabilities[label];
                                                        return <Row key={labelIndex}>
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
                                                    Object.keys(this.state.selectedWord.modifierProbabilities).map((label, labelIndex) =>
                                                    {
                                                        const prob = this.state.selectedWord.modifierProbabilities[label];
                                                        return <Row key={labelIndex}>
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
                        this.props.annotationFields.map((annotationFieldGroup) =>
                        {
                            let groupsElement = [];
                            if (annotationFieldGroup.groups)
                            {
                                groupsElement = annotationFieldGroup.groups.map((wordGroup) =>
                                {
                                    if (wordGroup.groupSet !== groupSet)
                                    {
                                        return null;
                                    }

                                    if (wordGroup.anyOfGroups)
                                    {
                                        if (!_.any(wordGroup.anyOfGroups, (group) => presentSelectionGroups.indexOf(group) !== -1))
                                        {
                                            return null;
                                        }
                                    }

                                    if (wordGroup.requiredGroups)
                                    {
                                        if (!_.all(wordGroup.requiredGroups, (group) => allSelectionGroups.indexOf(group) !== -1))
                                        {
                                            return null;
                                        }
                                    }

                                    if (wordGroup.textType)
                                    {
                                        if (presentSelectionTextTypes.indexOf(wordGroup.textType) === -1)
                                        {
                                            return null;
                                        }
                                    }

                                    return <MenuItem onClick={(evt, data) => this.createWordGroup(evt, wordGroup.value, wordGroup.groupSet)} key={wordGroup.value}>
                                        {wordGroup.name}
                                    </MenuItem>
                                });
                            }
                            groupsElement = _.filter(groupsElement, (elem) => elem);

                            let fieldsElement = [];
                            if (this.state.view === 'fields' && annotationFieldGroup.fields)
                            {
                                fieldsElement = annotationFieldGroup.fields.map((field) =>
                                {
                                    if (field.anyOfGroups)
                                    {
                                        if (!_.any(field.anyOfGroups, (group) => presentSelectionGroups.indexOf(group) !== -1))
                                        {
                                            return null;
                                        }
                                    }

                                    if (field.requiredGroups)
                                    {
                                        if (!_.all(field.requiredGroups, (group) => allSelectionGroups.indexOf(group) !== -1))
                                        {
                                            return null;
                                        }
                                    }

                                    if (field.textType)
                                    {
                                        if (presentSelectionTextTypes.indexOf(field.textType) === -1)
                                        {
                                            return null;
                                        }
                                    }

                                    return <MenuItem onClick={(evt, data) => this.changeWordClassification(evt, field.value)} key={field.value}>
                                        {field.name}
                                    </MenuItem>
                                });
                            }
                            fieldsElement = _.filter(fieldsElement, (elem) => elem);

                            let modifiersElement = [];
                            if (this.state.view === 'fields' && annotationFieldGroup.modifiers)
                            {
                                modifiersElement = annotationFieldGroup.modifiers.map((modifier) =>
                                {
                                    const elems = [];

                                    if (modifier.anyOfGroups)
                                    {
                                        if (!_.any(modifier.anyOfGroups, (group) => presentSelectionGroups.indexOf(group) !== -1))
                                        {
                                            return null;
                                        }
                                    }

                                    if (modifier.requiredGroups)
                                    {
                                        if (!_.all(modifier.requiredGroups, (group) => allSelectionGroups.indexOf(group) !== -1))
                                        {
                                            return null;
                                        }
                                    }

                                    if (modifier.textType)
                                    {
                                        if (presentSelectionTextTypes.indexOf(modifier.textType) === -1)
                                        {
                                            return null;
                                        }
                                    }

                                    if (presentSelectionModifiers.indexOf(modifier.value) !== -1)
                                    {
                                        elems.push(<MenuItem onClick={(evt, data) => this.removeWordModifiers(evt, modifier.value)} key={modifier.value + "-"}>
                                            --{modifier.name} {modifier.applyAcrossLine ? <span>(line)</span> : null}
                                        </MenuItem>);
                                    }

                                    if (allSelectionModifiers.indexOf(modifier.value) === -1)
                                    {
                                        elems.push(<MenuItem onClick={(evt, data) => this.addWordModifiers(evt, modifier.value)} key={modifier.value + "+"}>
                                            ++{modifier.name} {modifier.applyAcrossLine ? <span>(line)</span> : null}
                                        </MenuItem>);
                                    }

                                    return elems;
                                })
                            }
                            modifiersElement = _.filter(modifiersElement, (elem) => elem);

                            if ((!groupsElement || groupsElement.length === 0) && (!fieldsElement || fieldsElement.length === 0) && (!modifiersElement || modifiersElement.length === 0))
                            {
                                return null;
                            }

                            return <SubMenu title={annotationFieldGroup.name} key={annotationFieldGroup.name}>
                                {groupsElement}
                                {fieldsElement}
                                {modifiersElement}
                            </SubMenu>
                        })
                    }
                    {
                        this.state.view === 'fields' ?
                            <MenuItem onClick={(evt, data) => this.createWordGroup(evt, null, 'ITEM', true)}>
                                Continue Line Item Group
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
                    {
                        this.state.view === 'fields' ?
                            <MenuItem onClick={(evt, data) => this.clearWordClassification(evt)}>
                                Nothing
                            </MenuItem> : null
                    }
                </ContextMenu>
            </div>
        );
    }
}

export default AnnotationEditor;

import React from 'react';
import { ContextMenuTrigger } from "react-contextmenu";

class AnnotationExtractionToken extends React.Component
{
    constructor()
    {
        super();

        this.state ={
            word: {},
            wordIndex: -1,
            selected: false
        };
    }

    componentDidMount()
    {
        this.props.tokenRef(this);
        this.setState({
            word: this.props.word,
            wordIndex: this.props.wordIndex
        })
    }

    onMouseDown()
    {
        this.props.onWordMouseDown(this.props.wordIndex);
        // this.setState({"selected": true});
    }

    onMouseUp()
    {
        // this.props.onWordMouseUp(this.props.wordIndex);
        // this.setState({"selected": false});
    }

    onHoverStart()
    {
        this.props.onWordHoverStart(this.props.wordIndex);
    }

    onHoverEnd()
    {
        this.props.onWordHoverEnd(this.props.wordIndex);
    }

    render() {
        const word = this.state.word;
        const wordIndex = this.state.wordIndex;
        return (
            <ContextMenuTrigger id="annotation-editor-word-menu" collect={() => {return {wordIndex}} }>
                <div className={`annotation-editor-word ${this.state.selected ? 'selected' : ''} ${this.state.word.classification !== "null" ? 'classified' : ''}`}
                     style={{"top": `${word.top*100}%`, "left": `${word.left*100}%`, "width": `${word.right*100 - word.left*100}%`, "height": `${word.bottom*100 - word.top*100}%`}}
                     onMouseEnter={this.onHoverStart.bind(this)}
                     onMouseLeave={this.onHoverEnd.bind(this)}
                     onMouseDown={this.onMouseDown.bind(this)}
                     onMouseUp={this.onMouseUp.bind(this)}

                />
        </ContextMenuTrigger>
        );
    }
}

export default AnnotationExtractionToken;

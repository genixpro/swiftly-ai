import React, {Component} from 'react';
import './App.css';
import axios from "axios";

/*global chrome*/

class App extends Component {
    constructor() {
        super();
        this.apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        this.state = {mode: 'menu', appraisals: [], error: null};
    }

    componentDidMount() {
        axios.get(`${this.apiUrl}/appraisal/`).then(
            (response) => this.setState({appraisals: response.data.appraisals}),
            (err) => this.setState({error: `Could not load appraisals: ${err.message || err}`})
        );
    }

    async takePartialScreenshot(canvas, tab, top) {
        return new Promise((resolve) => {
            chrome.tabs.executeScript(tab.id, {code: `window.scrollTo(0, ${top});`}, () => {
                setTimeout(() => {
                    chrome.tabs.captureVisibleTab((screenshotUrl) => {
                        const context = canvas.getContext('2d');
                        chrome.tabs.executeScript(tab.id, {code: `document.documentElement.scrollTop`}, (result) => {
                            const image = document.createElement('img');
                            image.src = screenshotUrl;
                            image.onload = () => { context.drawImage(image, 0, result[0]); resolve(); };
                        });
                    });
                }, 250);
            });
        });
    }

    captureWholeScreen(appraisalId) {
        this.setState({mode: "capturing", error: null});
        chrome.tabs.query({active: true}, (tabs) => {
            const tab = tabs[0];
            chrome.tabs.executeScript(tab.id, {
                code: '[Math.max(document.documentElement.scrollHeight, document.body.scrollHeight), Math.max(document.documentElement.scrollWidth, document.body.scrollWidth), document.documentElement.scrollTop, window.innerHeight]'
            }, async (result) => {
                const [height, width, scrollTop, viewportHeight] = result[0];
                const canvas = document.createElement('canvas');
                canvas.width = width; canvas.height = height;
                for (let top = 0; top < height; top += viewportHeight) await this.takePartialScreenshot(canvas, tab, top);
                canvas.toBlob((imageData) => {
                    chrome.tabs.executeScript(tab.id, {code: `window.scrollTo(0, ${scrollTop});`}, () => {
                        const data = new FormData();
                        data.set("fileName", tab.url); data.set("file", imageData);
                        axios.post(`${this.apiUrl}/appraisal/${appraisalId}/files`, data).then(
                            () => { this.setState({mode: "confirmation"}); setTimeout(() => this.setState({mode: "menu"}), 3000); },
                            (error) => this.setState({mode: "menu", error: `Could not upload the capture: ${error.message || error}`})
                        );
                    });
                }, 'image/png');
            });
        });
    }

    render() {
        return <div className="App">
            {this.state.error && <div className="menu-header">{this.state.error}</div>}
            {this.state.mode === 'menu' && <div className="menu-entry" id="save-comparable" onClick={() => this.setState({mode: "selecting_appraisal"})}>Save as a Comparable Sale</div>}
            {this.state.mode === 'selecting_appraisal' && <div><div className="menu-header">Select Appraisal To Save To</div>
                {this.state.appraisals.map((appraisal) => <div className="menu-entry" key={appraisal._id} onClick={() => this.captureWholeScreen(appraisal._id)}>{appraisal.name}</div>)}</div>}
            {this.state.mode === 'capturing' && <img alt="Loading ..." src="loader.gif" className="loader-image" />}
            {this.state.mode === 'confirmation' && <img alt="Saved Successfully" src="checkmark.svg" className="checkmark-image" />}
        </div>;
    }
}

export default App;

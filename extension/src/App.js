import React, {Component} from 'react';
import './App.css';
import axios from "axios";

/*global chrome*/


class App extends Component {
    constructor() {
        super();

        this.apiUrl = "http://localhost:3002";
        this.state = {
            mode: 'menu'
        };
    }

    componentDidMount()
    {
        const options = {
            method: 'get',
            url: `${this.apiUrl}/appraisal/`
        };

        axios(options).then((response) => {
            this.setState({"appraisals": response.data.appraisals});
        }, (err) =>
        {
            alert(err.toString());
        })
    }


    async takePartialScreenshot(canvas, tab, top) {
        return new Promise((resolve, reject) => {
            chrome.tabs.executeScript(tab.id,
                {
                    code: `window.scrollTo(0, ${top});`
                }, () => {
                    setTimeout(() => {
                        chrome.tabs.captureVisibleTab((screenshotUrl) => {
                            let ctx = canvas.getContext('2d');

                            chrome.tabs.executeScript(tab.id,
                                {
                                    code: `document.documentElement.scrollTop`
                                }, (result) => {
                                    const scrollTop = result[0];

                                    let image_buffer = document.createElement('img');
                                    image_buffer.src = screenshotUrl; // From #1 capture tab
                                    image_buffer.onload = async () => {
                                        ctx.drawImage(image_buffer, 0, scrollTop);
                                        resolve();
                                    };
                                });
                        });
                    }, 250);
                }
            );
        });
    }

    captureWholeScreen(appraisalId) {
        this.setState({"mode": "capturing"});

        chrome.tabs.query({'active': true}, (tabs) => {
            const tab = tabs[0];
            chrome.tabs.executeScript(tab.id,
                {
                    code: '[(document.height !== undefined) ? document.height : document.body.offsetHeight, (document.width !== undefined) ? document.width : document.body.offsetWidth, document.documentElement.scrollTop]'
                }, async (result) => {
                    const height = result[0][0];
                    const width = result[0][1];
                    const scrollTop = result[0][2];

                    let canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    for (let top = 0; top < height; top += tab.height) {
                        await this.takePartialScreenshot(canvas, tab, top);
                    }

                    // Convert that back to a dataURL
                    canvas.toBlob((imageData) => {
                        chrome.tabs.executeScript(tab.id,
                            {
                                code: `window.scrollTo(0, ${scrollTop});`
                            }, () =>
                            {
                                const data = new FormData();
                                data.set("fileName", tab.url);
                                data.set("file", imageData);
                                const options = {
                                    method: 'post',
                                    url: `${this.apiUrl}/appraisal/${appraisalId}/files`,
                                    data: data
                                };

                                const uploadPromise = axios(options);
                                uploadPromise.then((response) => {
                                    this.setState({"mode": "confirmation"});

                                    setTimeout(() =>
                                    {
                                        this.setState({"mode": "menu"});
                                    }, 3000);
                                }, (error) => {
                                    alert(error.toString());

                                    console.log(error);
                                    console.log(JSON.stringify(error, null, 2));

                                    this.setState({"mode": "menu"});

                                });

                                uploadPromise.catch(() => {
                                    this.setState({"mode": "menu"});
                                });
                            });
                    }, 'image/png');
                });
        });
    }

    onSaveComparableClicked() {
        this.setState({"mode": "selecting_appraisal"})
    }


    onAppraisalSelected(appraisal) {
        this.captureWholeScreen(appraisal._id['$oid'])
    }


    render() {
        return (
            <div className="App">
                {
                    this.state.mode === 'menu' ? <div className="menu-entry" id="save-comparable" onClick={() => this.onSaveComparableClicked()}>
                        <span>Save as a Comparable Sale</span>
                    </div> : null
                }
                {
                    (this.state.mode === 'selecting_appraisal') ?
                        <div>
                            <div className={"menu-header"}>Select Appraisal To Save To</div>

                            {this.state.appraisals.map((appraisal) =>
                            {
                                return <div className="menu-entry" onClick={() => this.onAppraisalSelected(appraisal)}>
                                    <span>{appraisal.name}</span>
                                </div>;
                            })}
                        </div>
                        : null
                }
                {
                    (this.state.mode === 'capturing') ?
                        <div>
                            <img alt={"Loading ..."} src={"loader.gif"} className={"loader-image"} />
                        </div>
                        : null
                }
                {
                    (this.state.mode === 'confirmation') ?
                        <div>
                            <img alt={"Saved Successfully"} src={"checkmark.svg"} className={"checkmark-image"} />
                        </div>
                        : null
                }
            </div>
        );
    }
}

export default App;

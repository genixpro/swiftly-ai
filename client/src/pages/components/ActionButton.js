import React from 'react';
import {Button} from 'reactstrap';
import _ from "underscore";
// CSS Loaders
import 'loaders.css/loaders.css';


class ActionButton extends React.Component
{
    state = {
        loading: false,
        showingSuccess: false,
        showingFailure: false
    };

    componentDidMount()
    {

    }

    render()
    {
        const props = _.extend({}, this.props);

        props['onClick'] = () =>
        {
            const promise = this.props.onClick(...arguments);
            this.setState({loading: true, showingSuccess: false});

            let startTime = new Date();

            promise.then(() =>
            {
                let delay = Math.max(1, 500 - (Date.now() - startTime.getTime()));

                setTimeout( () =>
                {
                    this.setState({loading: false, showingSuccess: true});

                    setTimeout(() =>
                    {
                        this.setState({loading: false, showingSuccess: false});
                    }, 2000)
                }, delay);
            }, (err) =>
            {
                let delay = Math.max(1, 500 - (Date.now() - startTime.getTime()));

                setTimeout( () =>
                {
                    this.setState({loading: false, showingFailure: true});

                    setTimeout(() =>
                    {
                        this.setState({loading: false, showingFailure: false});
                    }, 2000)
                }, delay);
            });
        };

        return <Button {...props} className={"action-button"}>
            {
                this.state.loading ?
                    <div className={"button-loading-wrapper"}>
                        <span className={"children"}>{this.props.children}</span>
                        <div className={"loader-wrapper"}>
                            <div className="ball-pulse">
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                        </div>
                    </div>
                    : <span className={"contents"}>
                        <span className={"children"}> {this.props.children}</span>
                        {
                            this.state.showingSuccess ?
                                <i className={"fa fa-check result"}></i>
                                : null
                        }
                        {
                            this.state.showingFailure ?
                                <i className={"fa fa-times result"}></i>
                                : null
                        }
                    </span>
            }
        </Button>
    }
}


export default ActionButton;
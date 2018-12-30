// TOGGLE STATE
// -----------------------------------
import React from 'react';
import PropTypes from 'prop-types';
import $ from './wrapper.js';
import Storages from 'js-storage';

/** Handle states to/from localstorage */
class StateTogglerStorage {
    static STORAGE_KEY_NAME = 'jq-toggleState'
    /** Add a state to the browser storage to be restored later */
    addState(classname) {
        let data = Storages.localStorage.get(StateTogglerStorage.STORAGE_KEY_NAME);
        if (data instanceof Array) data.push(classname);
        else data = [classname];
        Storages.localStorage.set(StateTogglerStorage.STORAGE_KEY_NAME, data);
    }
    /** Remove a state from the browser storage */
    removeState(classname) {
        let data = Storages.localStorage.get(StateTogglerStorage.STORAGE_KEY_NAME);
        if (data) {
            let index = data.indexOf(classname);
            if (index !== -1) data.splice(index, 1);
            Storages.localStorage.set(StateTogglerStorage.STORAGE_KEY_NAME, data);
        }
    }
    /** Load the state string and restore the classlist */
    restoreState($elem) {
        let data = Storages.localStorage.get(StateTogglerStorage.STORAGE_KEY_NAME);
        if (data instanceof Array)
            $elem.addClass(data.join(' '));
    }
}

/**
 * Wraps an element and toggles a given class name on a
 * target element on click
 */
const StateToggler = props => {
    let prevClickHandler = props.onClick; // save the onClick of previous handler

    const toggle = new StateTogglerStorage();

    let classname = props.state; // the classname to apply/remove
    let target = props.target; // selector where to apply the state
    let noPersist = !!props.nopersist; // avoid saving state to localstorage

    const $target = $(target);

    // restore body classes on init
    toggle.restoreState($target);

    const handleClick = e => {

        if (prevClickHandler) prevClickHandler.call();

        // e.stopPropagation();
        if (e.currentTarget.tagName === 'A') e.preventDefault();

        if (classname) {
            if ($target.hasClass(classname)) {
                $target.removeClass(classname);
                if (!noPersist)
                    toggle.removeState(classname);
            } else {
                $target.addClass(classname);
                if (!noPersist)
                    toggle.addState(classname);
            }
        }

        // some elements may need this when toggled class change the content size
        if (typeof(Event) === 'function') { // modern browsers
            window.dispatchEvent(new Event('resize'));
        } else { // old browsers and IE
            var resizeEvent = window.document.createEvent('UIEvents');
            resizeEvent.initUIEvent('resize', true, false, window, 0);
            window.dispatchEvent(resizeEvent);
        }

    }

    return (
        React.cloneElement(React.Children.only(props.children), {
            onClick: handleClick
        })
    )
}

StateToggler.propTypes = {
    /** used to preserve previous click handler */
    onClick: PropTypes.func,
    /** class name to toggle */
    state: PropTypes.string.isRequired,
    /** css selector of the element to toggle class */
    target: PropTypes.string,
    /** don't save to localstorage */
    nopersist: PropTypes.bool,
    /** allows only one child element */
    children: PropTypes.element.isRequired
}

StateToggler.defaultProps = {
    target: 'body'
}

export default StateToggler;
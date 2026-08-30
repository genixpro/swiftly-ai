/**=========================================================
 * Module: trigger-resize.js
 * Triggers a window resize event from any element
 =========================================================*/
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Attaches a click event to child element
 * and triggers a window resize event when clicked
 */
const TriggerResize = props => {

    const resize = e => {
        // all IE friendly dispatchEvent
        var evt = document.createEvent('UIEvents');
        evt.initUIEvent('resize', true, false, window, 0);
        window.dispatchEvent(evt);
        // modern dispatchEvent way
        // window.dispatchEvent(new Event('resize'));
    }

    return (
        React.cloneElement(React.Children.only(props.children), {
            onClick: resize
        })
    )
}

TriggerResize.propTypes = {
    /** only one children alloed */
    children: PropTypes.element.isRequired
}

export default TriggerResize;

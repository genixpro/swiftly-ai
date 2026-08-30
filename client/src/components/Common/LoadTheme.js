// LOAD THEMES
// -----------------------------------

import React from 'react';
import PropTypes from 'prop-types';
import $ from './wrapper.js';

const LINK_ID = 'theme-stylesheet';
const themes = {
    'A': 'themes/theme-a.css',
    'B': 'themes/theme-b.css',
    'C': 'themes/theme-c.css',
    'D': 'themes/theme-d.css',
    'E': 'themes/theme-e.css',
    'F': 'themes/theme-f.css',
    'G': 'themes/theme-g.css',
    'H': 'themes/theme-h.css'
}
/**
 * Attaches a click event to child element and
 * load a specified theme
 */
const LoadTheme = props => {

    const linkTag = createLink();

    // handle default theme
    if(props.default) {
        injectStylesheet(themes[props.theme]);
    }

    // function that returns a function to
    // set param for each component created
    const setTheme = name => () => {
        if (themes[name])
            injectStylesheet(themes[name]);
    }

    function createLink() {
        const tag = $(`#${LINK_ID}`)
        if (tag.length)
            return tag;
        else // if not exists => create
            return $('<link/>').attr({
                'id': LINK_ID,
                'rel': 'stylesheet'
            }).appendTo($('head'));
    }

    function injectStylesheet(stylesheet) {
        linkTag.attr('href', stylesheet);
    }

    return (
        React.cloneElement(React.Children.only(props.children), {
            onClick: setTheme(props.theme)
        })
    )

}

LoadTheme.propTypes = {
    /** the name of theme to load */
    theme: PropTypes.string,
    /** set theme as default */
    default: PropTypes.bool,
    /** only one children element allowed */
    children: PropTypes.element.isRequired
}

export default LoadTheme;
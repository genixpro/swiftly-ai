import 'core-js/es6/string';
import 'core-js/es6/array';
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'raf/polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

import './i18n';
import HTML5Backend from "react-dnd-html5-backend/lib/index";
import { DragDropContextProvider,  } from 'react-dnd'

ReactDOM.render(
    <DragDropContextProvider backend={HTML5Backend}>
        <App />
    </DragDropContextProvider>, document.getElementById('app'));

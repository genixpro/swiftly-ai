import 'core-js/es6/string';
import 'core-js/es6/array';
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'raf/polyfill';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import App from './App';

import './i18n';

createRoot(document.getElementById('app')).render(
    <DragDropContextProvider backend={HTML5Backend}>
        <App />
    </DragDropContextProvider>
);

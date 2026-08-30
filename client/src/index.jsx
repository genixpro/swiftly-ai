import React, {StrictMode} from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AppDndContext from './dnd/AppDndContext';

import './i18n';

createRoot(document.getElementById('app')).render(
    <StrictMode>
        <AppDndContext><App /></AppDndContext>
    </StrictMode>
);

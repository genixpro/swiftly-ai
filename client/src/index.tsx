import {StrictMode} from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AppDndContext from './dnd/AppDndContext';

import './i18n';

const applicationRoot = document.getElementById('app');
if (!applicationRoot) throw new Error('Swiftly application root was not found.');

createRoot(applicationRoot).render(
    <StrictMode>
        <AppDndContext><App /></AppDndContext>
    </StrictMode>
);

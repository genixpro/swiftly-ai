import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import DropzoneCompat from './DropzoneCompat';

describe('DropzoneCompat', () => {
    it('retains the root/input structure and render-prop state contract', () => {
        render(<DropzoneCompat className="drop-target" align="center" disableClick inputProps={{'aria-label': 'Upload files'}}>
            {({isDragActive}) => <output>{isDragActive ? 'dragging' : 'idle'}</output>}
        </DropzoneCompat>);

        expect(screen.getByLabelText('Upload files')).toBeInTheDocument();
        expect(screen.getByText('idle').closest('.drop-target')).toHaveStyle({textAlign: 'center'});
    });
});

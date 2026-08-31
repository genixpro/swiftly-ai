import {describe, expect, it, vi} from 'vitest';
import {chooseBrowserFiles} from './browserFilePicker';

describe('browser file picker adapter', () => {
    it('opens a file input and forwards its selected files once', () => {
        const input = document.createElement('input');
        const click = vi.spyOn(input, 'click').mockImplementation(() => undefined);
        const file = new File(['sale'], 'sale.pdf', {type: 'application/pdf'});
        Object.defineProperty(input, 'files', {value: {0: file, length: 1} as unknown as FileList});
        vi.spyOn(document, 'createElement').mockReturnValue(input);
        const onFiles = vi.fn();

        chooseBrowserFiles(onFiles);
        input.dispatchEvent(new Event('change'));
        input.dispatchEvent(new Event('change'));

        expect(input.type).toBe('file');
        expect(click).toHaveBeenCalledOnce();
        expect(onFiles).toHaveBeenCalledTimes(1);
        expect(onFiles).toHaveBeenCalledWith(input.files);
    });
});

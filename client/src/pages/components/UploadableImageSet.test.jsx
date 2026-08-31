import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import UploadableImageSet from './UploadableImageSet';

const hooks = vi.hoisted(() => ({uploadImage: {mutateAsync: vi.fn()}, useUploadImage: vi.fn()}));
vi.mock('@api/hooks', () => ({useUploadImage: hooks.useUploadImage}));
vi.mock('@components/Common/DropzoneCompat', () => ({
    default: ({children, onDrop}) => <div><button type="button" onClick={() => onDrop([new File(['image'], 'building.png', {type: 'image/png'})])}>Mock upload</button>{children}</div>,
}));

beforeEach(() => {
    hooks.useUploadImage.mockReturnValue(hooks.uploadImage);
});

afterEach(() => vi.restoreAllMocks());

describe('UploadableImageSet', () => {
    it('keeps the existing empty-state image and read-only controls', () => {
        const {container} = render(<UploadableImageSet value={[]} captions={[]} editable={false} address="1 Bay Street" />);

        expect(screen.getByRole('img', {name: 'Property at 1 Bay Street'})).toHaveAttribute('src', '/img/no_building_image.png');
        expect(screen.queryByRole('button', {name: 'Add property image'})).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /Delete property image/})).not.toBeInTheDocument();
        expect(container.querySelectorAll('.uploadable-image-carousel-spacer')).toHaveLength(3);
    });

    it('treats an undefined editable prop as editable, like the legacy class default', () => {
        render(<UploadableImageSet value={[]} captions={[]} editable={undefined} />);

        expect(screen.getByRole('button', {name: 'Add property image'})).toBeInTheDocument();
    });

    it('retains thumbnail deletion and fullscreen toggle behavior', () => {
        const requestFullscreen = vi.fn();
        const exitFullscreen = vi.fn();
        Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {configurable: true, value: requestFullscreen});
        Object.defineProperty(document, 'exitFullscreen', {configurable: true, value: exitFullscreen});
        const images = ['/one.png', '/two.png'];
        const onChange = vi.fn();
        const {container} = render(<UploadableImageSet value={images} captions={['One', 'Two']} onChange={onChange} />);

        expect(screen.getAllByRole('img', {name: /Property thumbnail/})).toHaveLength(2);
        fireEvent.click(screen.getByRole('button', {name: 'Delete property image 2'}));
        expect(images).toEqual(['/one.png']);
        expect(onChange).toHaveBeenCalledWith(images);

        const fullscreen = screen.getByRole('button', {name: 'View property image fullscreen'});
        fireEvent.click(fullscreen);
        expect(requestFullscreen).toHaveBeenCalledOnce();
        expect(container.querySelector('.uploadable-image.fullscreen')).not.toBeNull();
        fireEvent.click(fullscreen);
        expect(exitFullscreen).toHaveBeenCalledOnce();
        expect(container.querySelector('.uploadable-image.fullscreen')).toBeNull();
    });

    it('uploads the selected image, adds its returned URL, and clears the loading state', async () => {
        hooks.uploadImage.mutateAsync.mockResolvedValue('/uploaded-building.png');
        const images = [];
        const onChange = vi.fn();
        render(<UploadableImageSet value={images} captions={[]} onChange={onChange} />);

        fireEvent.click(screen.getByRole('button', {name: 'Mock upload'}));

        await waitFor(() => expect(hooks.uploadImage.mutateAsync).toHaveBeenCalledOnce());
        expect(hooks.uploadImage.mutateAsync.mock.calls[0][0].get('fileName')).toBe('building.png');
        await waitFor(() => expect(onChange).toHaveBeenCalledWith(['/uploaded-building.png']));
        expect(images).toEqual(['/uploaded-building.png']);
    });
});

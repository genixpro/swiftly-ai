import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import TagEditor from './TagEditor';

const hooks = vi.hoisted(() => ({
    createTag: {mutateAsync: vi.fn()},
    defaultTagsQuery: {data: undefined, refetch: vi.fn()},
    deleteTag: {mutateAsync: vi.fn()},
    searchTags: vi.fn(),
    useCreatePropertyTag: vi.fn(),
    useDeletePropertyTag: vi.fn(),
    usePropertyTags: vi.fn(),
    usePropertyTagSearch: vi.fn(),
    select: {blur: vi.fn()},
}));
vi.mock('@api/hooks', () => ({
    useCreatePropertyTag: hooks.useCreatePropertyTag,
    useDeletePropertyTag: hooks.useDeletePropertyTag,
    usePropertyTags: hooks.usePropertyTags,
    usePropertyTagSearch: hooks.usePropertyTagSearch,
}));
vi.mock('react-select/async-creatable', () => ({
    default: React.forwardRef(({components, loadOptions, onChange, onCreateOption}, ref) => {
        React.useImperativeHandle(ref, () => hooks.select);
        const Option = components.Option;
        return <>
        <button onClick={() => onChange([{value: 'Office', label: 'Office'}])}>Select tag</button>
        <button onClick={() => onCreateOption('Retail')}>Create tag</button>
        <button onClick={() => loadOptions('Retail', (options) => onChange(options))}>Search tags</button>
        <Option isDisabled={false} innerProps={{}} data={{label: 'Existing'}} value="tag-1" />
    </>;
    }),
}));

beforeEach(() => {
    hooks.createTag.mutateAsync.mockReset().mockResolvedValue('tag-2');
    hooks.deleteTag.mutateAsync.mockReset().mockResolvedValue();
    hooks.defaultTagsQuery.data = [{name: 'Office'}];
    hooks.defaultTagsQuery.refetch.mockReset();
    hooks.select.blur.mockReset();
    hooks.searchTags.mockReset().mockResolvedValue([{name: 'Retail'}]);
    hooks.useCreatePropertyTag.mockReset().mockReturnValue(hooks.createTag);
    hooks.useDeletePropertyTag.mockReset().mockReturnValue(hooks.deleteTag);
    hooks.usePropertyTags.mockReset().mockImplementation(() => hooks.defaultTagsQuery);
    hooks.usePropertyTagSearch.mockReset().mockReturnValue(hooks.searchTags);
});

describe('tag editor characterization', () => {
    it('loads property-type defaults and forwards selected and created tags', async () => {
        const onChange = vi.fn();
        render(<TagEditor propertyType="industrial" value={['Existing']} onChange={onChange}/>);
        await waitFor(() => expect(hooks.usePropertyTags).toHaveBeenCalledWith({propertyType: 'industrial'}));
        fireEvent.click(screen.getByRole('button', {name: 'Select tag'}));
        fireEvent.click(screen.getByRole('button', {name: 'Create tag'}));
        await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(['Existing', 'Retail']));
        expect(onChange).toHaveBeenNthCalledWith(1, ['Office']);
        expect(hooks.createTag.mutateAsync).toHaveBeenCalledWith({name: 'Retail', propertyType: 'industrial'});
    });

    it('keeps the async search callback scoped to the active property type', async () => {
        const onChange = vi.fn();
        render(<TagEditor propertyType="industrial" onChange={onChange}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Search tags'}));

        await waitFor(() => expect(hooks.searchTags).toHaveBeenCalledWith({name: 'Retail', propertyType: 'industrial'}));
        await waitFor(() => expect(onChange).toHaveBeenCalledWith(['Retail']));
    });

    it('reloads defaults and blurs the select after deleting an existing tag', async () => {
        const {container} = render(<TagEditor propertyType="industrial" value={['Existing']} onChange={vi.fn()}/>);

        fireEvent.click(container.querySelector('.delete-tag-button'));

        await waitFor(() => expect(hooks.deleteTag.mutateAsync).toHaveBeenCalledWith('tag-1'));
        await waitFor(() => expect(hooks.defaultTagsQuery.refetch).toHaveBeenCalledOnce());
        expect(hooks.select.blur).toHaveBeenCalledOnce();
    });
});

import React from 'react';
import type {ComponentType, FocusEventHandler, HTMLAttributes, MouseEvent, RefObject} from 'react';
import AsyncCreatableRaw from 'react-select/async-creatable';
import {Button} from 'reactstrap';
import {useCreatePropertyTag, useDeletePropertyTag, usePropertyTagSearch, usePropertyTags} from '@api/hooks';

interface TagOption {
    label?: string;
    value?: string;
}

interface TagOptionRendererProps {
    data: TagOption & {__isNew__?: boolean};
    innerProps?: HTMLAttributes<HTMLDivElement>;
    isDisabled?: boolean;
    value?: string;
}

interface TagAsyncCreatableProps {
    'aria-label'?: string;
    className?: string;
    classNamePrefix?: string;
    components?: {Option: ComponentType<TagOptionRendererProps>};
    defaultOptions?: TagOption[];
    isClearable?: boolean;
    isDisabled?: boolean;
    isMulti?: boolean;
    loadOptions(inputValue: string, callback: (options: TagOption[]) => void): void;
    noOptionsMessage?(): React.ReactNode;
    onBlur?: FocusEventHandler<HTMLElement>;
    onChange?(value: readonly TagOption[]): void;
    onCreateOption?(value: string): void;
    ref?: RefObject<{blur(): void} | null>;
    value?: TagOption[];
}

const AsyncCreatable = AsyncCreatableRaw as unknown as ComponentType<TagAsyncCreatableProps>;

interface TagEditorProps {
    disabled?: boolean;
    onBlur?: FocusEventHandler<HTMLElement>;
    onChange?(tags: string[]): void;
    propertyType?: string;
    title?: string;
    value?: string[] | null;
}

function TagEditor(props: TagEditorProps) {
    const [state, setState] = React.useState({
        selectedOption: null,
        tags: [] as TagOption[],
    });
    const selectRef = React.useRef<{blur(): void} | null>(null);
    const defaultSearch = props.propertyType ? {propertyType: props.propertyType} : {};
    const defaultTagsQuery = usePropertyTags(defaultSearch);
    const createTag = useCreatePropertyTag();
    const deleteTagMutation = useDeletePropertyTag();
    const searchTags = usePropertyTagSearch();
    const displayedTags = props.value ? props.value.map((tag) => ({value: tag, label: tag})) : state.tags;
    const defaultOptions = defaultTagsQuery.data?.map((tag) => ({value: tag.name, label: tag.name}));
    const reloadDefaults = () => {
        void defaultTagsQuery.refetch();
    };
    const onCreateTag = (data: string) => {
        const newTag: {name: string; propertyType?: string} = {name: data};

        if (props.propertyType)
        {
            newTag.propertyType = props.propertyType;
        }

        createTag.mutateAsync(newTag).then(() =>
        {
            const tags = [...displayedTags, {value: data, label: data}];
            setState((currentState) => ({...currentState, tags}));
            props.onChange!(tags.map((tag) => tag.label) as string[]);
        });
    };
    const loadOptions = (inputValue: string, callback: (options: TagOption[]) => void) => {
        const search: {name: string; propertyType?: string} = {name: inputValue};
        if (props.propertyType)
        {
            search.propertyType = props.propertyType;
        }

        searchTags(search).then((tags) =>
        {
            callback(tags.map((tag) => ({value: tag.name, label: tag.name}) ));
        });
    };
    const onChange = (newTags: TagOption[]) => {
        if (props.onChange)
        {
            props.onChange(newTags.map((tag) => tag.label) as string[]);
            setState((currentState) => ({...currentState, tags: newTags}));
        }
    };
    const deleteTag = (evt: MouseEvent<HTMLElement>, tagId: string) => {
        evt.stopPropagation();
        deleteTagMutation.mutateAsync(tagId).then(() =>
        {
            reloadDefaults();
            selectRef.current?.blur();
        });
    };

        // const { selectedOption } = this.state;

        const CustomOption = (data: TagOptionRendererProps) =>
        {
            return !data.isDisabled ? (
                <div {...(data.innerProps)} className={"tag-editor-option"}>
                    {data.data.label}

                    {
                        !data.data.__isNew__ ?
                                <Button className={"delete-tag-button"} color={"secondary"} onClick={(evt: MouseEvent<HTMLElement>) => deleteTag(evt, data.value as string)} >
                                <i className={"fa fa-times"} />
                            </Button> : null
                    }
                </div>
            ) : null;
        };

        return (
            <AsyncCreatable
                className={"tag-editor"}
                classNamePrefix={"tag-editor"}
                value={displayedTags}
                // cacheOptions
                isClearable
                isMulti
                isDisabled={props.disabled}
                aria-label={props.title || "Property subtype tags"}
                defaultOptions={defaultOptions}
                loadOptions={loadOptions}
                onCreateOption={onCreateTag}
                noOptionsMessage={() => <span>Search for or Type in a Tag</span>}
                ref={selectRef}
                onChange={onChange}
                onBlur={props.onBlur}
                components={{ Option: CustomOption }}
            />
        );
}



export default TagEditor;

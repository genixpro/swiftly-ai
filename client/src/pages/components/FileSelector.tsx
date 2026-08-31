import type {ChangeEvent, RefCallback} from 'react';
import {useEffect, useRef} from 'react';
import {useFiles} from '@api/hooks';

interface FileSelectorProps {
    appraisalId: string;
    ariaLabel?: string;
    defaultFile?: string | null;
    disabled?: boolean;
    innerRef?: RefCallback<HTMLSelectElement>;
    onBlur?(): void;
    onChange?(fileId: string): void;
    value?: string | null;
}

function FileSelector(props: FileSelectorProps)
{
    const filesQuery = useFiles(props.appraisalId);
    const files = filesQuery.data ?? [];
    const initialSelectionHandled = useRef(false);

    useEffect(() =>
    {
        if (initialSelectionHandled.current || !filesQuery.data)
        {
            return;
        }

        initialSelectionHandled.current = true;

        const defaultFile = props.defaultFile ? filesQuery.data.find((file) => file._id === props.defaultFile) : undefined;
        const previewableFile = filesQuery.data.find((file) => Number(file.pages) > 0);
        const selectedFile = defaultFile ?? previewableFile ?? filesQuery.data[0];

        if (selectedFile)
        {
            onChangeValue(selectedFile._id);
        }
    }, [filesQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps -- preserve legacy one-time default selection after initial load.

    function onChangeValue(newValue: string)
    {
        if (props.onChange)
        {
            if (newValue !== props.value && newValue !== "")
            {
                props.onChange(newValue);
            }
        }
    }

    function onBlur()
    {
        if (props.onBlur)
        {
            props.onBlur();
        }
    }

    function onRef(select: HTMLSelectElement | null)
    {
        if (props.innerRef)
        {
            props.innerRef(select);
        }
    }

    return (
        <select
            className="form-select"
            onBlur={() => onBlur()}
            ref={(ref) => onRef(ref)}
            value={props.value ?? ""}
            disabled={props.disabled}
            aria-label={props.ariaLabel || "Source file"}
            onChange={(evt: ChangeEvent<HTMLSelectElement>) => onChangeValue(evt.currentTarget.value)}
            style={files.length === 0 ? {"color": "lightgray"} : undefined}
        >
            {
                files.length === 0 ?
                    <option value={""}>No files attached to appraisal</option>
                    : null
            }
            {
                files.map((file) =>
                    <option value={file._id} key={file._id}>{file.fileName}</option>
                )
            }
        </select>
    );
}


export default FileSelector;

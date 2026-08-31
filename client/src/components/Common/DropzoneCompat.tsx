import type {AriaRole, CSSProperties, KeyboardEventHandler, ReactNode} from 'react';
import {forwardRef, useImperativeHandle} from 'react';
import {useDropzone, type DropzoneInputProps, type DropzoneOptions, type DropzoneRef, type DropzoneState} from 'react-dropzone';

interface DropzoneCompatProps extends DropzoneOptions {
    children?: ReactNode | ((dropzone: DropzoneState) => ReactNode);
    className?: string;
    disableClick?: boolean;
    inputProps?: DropzoneInputProps;
    align?: CSSProperties['textAlign'];
    'aria-busy'?: boolean | 'true' | 'false';
    'aria-label'?: string;
    onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
    role?: AriaRole;
    tabIndex?: number;
}

const DropzoneCompat = forwardRef<DropzoneRef, DropzoneCompatProps>(function DropzoneCompat(
    {children, className, disableClick, inputProps, align, onKeyDown, role, tabIndex, 'aria-busy': ariaBusy, 'aria-label': ariaLabel, ...options},
    ref,
) {
    const dropzone = useDropzone({...options, noClick: disableClick});
    useImperativeHandle(ref, () => ({open: dropzone.open}), [dropzone.open]);
    const content = typeof children === 'function' ? children(dropzone) : children;
    return <div {...dropzone.getRootProps({className, onKeyDown, role, tabIndex, 'aria-busy': ariaBusy, 'aria-label': ariaLabel, style: align ? {textAlign: align} : undefined})}>
        <input {...dropzone.getInputProps(inputProps)} />
        {content}
    </div>;
});

export default DropzoneCompat;
